"use strict";
const db = require("../config/db.js");
const { getGeoLocation } = require("../utils/geo");
const { broadcast } = require("../ws/ws-broadcast");

/**
 * Utilities
 */
function generateId() {
  // produce a reasonably-unique numeric id (fits into BIGINT)
  // Date.now() * 1000 gives microsecond-ish base; add random 3 digits
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

function makeNonNullUserId(userId, sessionId) {
  // online_users.user_id is NOT NULL (varchar(50)).
  // If there is no real userId, synthesize one using sessionId.
  // Keep length <= 50.
  if (userId) return String(userId).slice(0, 50);
  if (!sessionId) {
    // fallback stable guest id
    return `guest_${String(generateId()).slice(0, 40)}`;
  }
  const candidate = `guest_${String(sessionId)}`;
  return candidate.length <= 50 ? candidate : candidate.slice(0, 50);
}

/**
 * AnalyticsModel - production-ready
 */
class Analytics {
  /**
   * - Save user activity (main entry point).
   * - Inserts into user_activity_logs
   * - Upserts into online_users (keeps last_seen)
   * - Broadcasts via WebSocket: newActivity + onlineUsers
   *
   * @param {object} req - Express request (used for req.user, req.sessionID, req.originalUrl etc.)
   * @param {string} activityType - short activity type label
   * @param {string} details - optional detail text
   */
  static async saveUserActivity(req, activityType, details = "") {
    try {
      const user = req.user || {};
      const rawUserId = user.user_id || user._id || user.id || null;
      const sessionId =
        req.sessionID || (req.headers && req.headers["x-session-id"]) || null;

      // Compose values
      const userIdForDb = makeNonNullUserId(rawUserId, sessionId); // guarantees non-null & length <=50
      const userName = user.username || user.name || user.email || "Guest";
      const avatar = user.profilePicture || "/images/profile/avatar.png";
      const ip =
        (req.headers &&
          req.headers["x-forwarded-for"] &&
          req.headers["x-forwarded-for"].split(",")[0].trim()) ||
        req.ip ||
        req.socket?.remoteAddress ||
        "0.0.0.0";

      const geo = (await getGeoLocation(ip).catch(() => ({}))) || {};
      const cleanDetails = String(details || "").slice(0, 500);
      const url = String(req.originalUrl || req.url || "").slice(0, 1000);
      const method = String(req.method || "GET").slice(0, 10);
      const userAgent =
        req.get && req.get("User-Agent")
          ? req.get("User-Agent").slice(0, 500)
          : null;

      // Insert id generation for user_activity_logs because the schema's id is non-auto-increment
      const activityId = generateId();

      const activityRow = {
        id: activityId,
        user_id: rawUserId || null, // keep original user id (nullable) in the logs
        session_id: sessionId,
        activity_type: activityType,
        details: cleanDetails,
        ip_address: ip,
        user_agent: userAgent,
        url,
        method,
        country: geo.country || null,
        country_code: geo.countryCode || null,
        city: geo.city || null,
        timezone: geo.timezone || null,
      };

      // INSERT into user_activity_logs
      // Note: include id column explicitly because your CREATE TABLE shows id NOT auto_increment.
      const insertActivitySql = `
        INSERT INTO user_activity_logs
        (id, user_id, session_id, activity_type, details, ip_address, user_agent, url, method,
         country, country_code, city, timezone, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      const insertActivityParams = [
        activityRow.id,
        activityRow.user_id,
        activityRow.session_id,
        activityRow.activity_type,
        activityRow.details,
        activityRow.ip_address,
        activityRow.user_agent,
        activityRow.url,
        activityRow.method,
        activityRow.country,
        activityRow.country_code,
        activityRow.city,
        activityRow.timezone,
      ];

      await db.query(insertActivitySql, insertActivityParams);

      // Upsert online_users.
      // Because online_users.user_id is NOT NULL, use userIdForDb (guaranteed non-null).
      // Use session_id also not null per schema; if sessionId missing, we still include the synthetic userId.
      const currentPage = (url || "").split("?")[0].slice(0, 1000);
      const flag = geo.flag || null;

      // We use INSERT ... ON DUPLICATE KEY UPDATE but the table has no PK in your pasted schema.
      // To enable upsert we rely on a composite primary key (user_id, session_id).
      // If your DB doesn't have that PK, please consider adding: PRIMARY KEY (user_id, session_id)
      const upsertOnlineSql = `
        INSERT INTO online_users
        (user_id, session_id, user_name, avatar, current_page, country, city, flag, last_seen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          user_name = VALUES(user_name),
          avatar = VALUES(avatar),
          current_page = VALUES(current_page),
          country = VALUES(country),
          city = VALUES(city),
          flag = VALUES(flag),
          last_seen = NOW()
      `;
      const upsertOnlineParams = [
        userIdForDb,
        sessionId || userIdForDb, // ensure session_id non-null if DB enforces NOT NULL (your schema has session_id NOT NULL)
        userName.slice(0, 100),
        avatar.slice(0, 255),
        currentPage,
        geo.country || null,
        geo.city || null,
        flag,
      ];

      // If session_id is null in upsert params and DB enforces NOT NULL, replace it with synthesized value
      if (!upsertOnlineParams[1]) {
        upsertOnlineParams[1] = userIdForDb; // fallback
      }

      await db.query(upsertOnlineSql, upsertOnlineParams);

      // Broadcast the activity to all websocket clients
      const activityPayload = {
        id: activityRow.id,
        userId: rawUserId || null,
        userIdForDb,
        userName,
        avatar,
        sessionId,
        activityType,
        details: cleanDetails,
        url,
        method,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        country: geo.country || null,
        countryCode: geo.countryCode || null,
        city: geo.city || null,
        flag,
        timezone: geo.timezone || null,
      };

      broadcast({ type: "newActivity", data: activityPayload });

      // Broadcast current online users (last_seen within 3 minutes)
      try {
        const [onlineRows] = await db.query(
          `SELECT user_id, session_id, user_name, avatar, current_page, country, city, flag
           FROM online_users
           WHERE last_seen >= NOW() - INTERVAL 3 MINUTE`,
        );

        broadcast({ type: "onlineUsers", data: onlineRows });
      } catch (err) {}
    } catch (err) {
      // Do not let analytics crash the app. Log details for debugging.
      // console.error('Failed to save user activity:', err);
      throw err;
    }
  }

  /**
   * Record page duration and optionally remove user from online_users on exit.
   * @param {object} req - express request
   * @param {string} page
   * @param {number} duration - milliseconds
   * @param {boolean} isExit
   */
  static async updateUserDuration(req, page, duration = 0, isExit = false) {
    // console.log(page, duration)
    try {
      const user = req.user || {};
      const rawUserId = user.user_id || user._id || user.id || null;
      const sessionId =
        req.sessionID || (req.headers && req.headers["x-session-id"]) || null;
      const userIdForDb = makeNonNullUserId(rawUserId, sessionId);

      const insertSql = `
        INSERT INTO page_durations (id, user_id, session_id, page, duration, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const id = generateId();
      await db.query(insertSql, [
        id,
        rawUserId || null,
        sessionId || null,
        String(page).slice(0, 1000),
        Number(duration || 0),
      ]);

      if (isExit) {
        // remove from online_users where user_id matches synthesized key OR session_id matches
        const delSql = `DELETE FROM online_users WHERE user_id = ? OR session_id = ?`;
        await db.execute(delSql, [userIdForDb, sessionId || userIdForDb]);

        // broadcast updated onlineUsers
        try {
          const [onlineRows] = await db.query(
            `SELECT user_id, session_id, user_name, avatar, current_page, country, city, flag
             FROM online_users
             WHERE last_seen >= NOW() - INTERVAL 3 MINUTE`,
          );
          broadcast({ type: "onlineUsers", data: onlineRows });
        } catch (err) {
            console.error('analyticsModel.updateUserDuration: failed to query online users after exit:', err);
          throw err;
          
        }
      }
    } catch (err) {
      throw err;
      // console.error('analyticsModel.updateUserDuration error:', err);
    }
  }

  /**
   * log user activity
   */
static async logUserActivity(user, type, start, end) {
    try {
        const [rows] = await db.query(`
            SELECT 
                l.id AS log_id,
                l.activity_type,
                l.details,
                l.url,
                l.ip_address,
                l.user_agent,
                l.created_at,
                u.username AS user_name,
                u.email AS user_email
            FROM user_activity_logs AS l
            LEFT JOIN teachers AS u 
                ON l.user_id = u.id
            WHERE (u.username LIKE ? OR ? = '')
              AND (l.activity_type LIKE ? OR ? = '')
              AND (DATE(l.created_at) >= ? OR ? = '')
              AND (DATE(l.created_at) <= ? OR ? = '')
            ORDER BY l.created_at DESC
            LIMIT 500
        `, [
            `%${user}%`, user,
            `%${type}%`, type,
            start, start,
            end, end
        ]);

        return rows;

    } catch (err) {
        throw err;
    }
}

  /**
   * Get heatmap (most visited pages last 24h)
   */
static async heatmap(limit) {
    try {
        const [rows] = await db.query(
            `
            SELECT 
                url AS page,
                COUNT(*) AS count
            FROM user_activity_logs
            WHERE created_at >= NOW() - INTERVAL 24 HOUR
            GROUP BY url
            ORDER BY count DESC
            LIMIT ${limit}
            `
        );
        return rows;

    } catch (err) {
        console.error("getHeatmap error:", err);
        throw err;
    }
}

  /**
   * Export CSV of recent activity logs
   */
  static async exportCSV(limit = 10000) {
    try {
      const rows = db.query(
        `SELECT user_id, session_id, activity_type, details, ip_address, url, method, created_at
         FROM user_activity_logs
         ORDER BY created_at DESC
         LIMIT ?`,
        [Number(limit)],
      );

      const header =
        "User ID,Session ID,Activity,Details,IP,URL,Method,Created At\n";
      const lines = rows.map((r) => {
        // escape quotes in details/url
        const details = (r.details || "").replace(/"/g, '""');
        const url = (r.url || "").replace(/"/g, '""');
        return `${r.user_id || ""},${r.session_id || ""},"${r.activity_type || ""}","${details}","${r.ip_address || ""}","${url}","${r.method || ""}",${r.created_at}`;
      });

      return Buffer.from(header + lines.join("\n"), "utf8");
    } catch (err) {
      return Buffer.from("");
    }
  }

  /**
   * Return current online users (last seen within windowMinutes)
   */
  static async getOnlineUsers(windowMinutes = 3) {
    try {
      const [rows] = await db.query(
        `SELECT user_id, session_id, user_name, avatar, current_page, country, city, flag
         FROM online_users
         WHERE last_seen >= NOW() - INTERVAL ? MINUTE`,
        [Number(windowMinutes)],
      );
      return rows;
    } catch (err) {
      return [];
    }
  }
}

module.exports = Analytics;
