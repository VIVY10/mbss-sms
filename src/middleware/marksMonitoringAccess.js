const db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const userType = String(req.user?.usertype || "").toLowerCase();
    if (userType === "admin") return next();

    const teacherid = req.user?.teacherid ?? req.user?.id;
    if (!teacherid) return res.status(403).json({ success: false, message: "Access denied." });

    const [rows] = await db.promise().query(`
      SELECT departmentid FROM department WHERE hod_id = ? LIMIT 1
    `, [teacherid]);

    if (!rows.length) return res.status(403).json({ success: false, message: "Only administrators and appointed HODs may access marks monitoring." });

    req.marksMonitoringRole = "hod";
    next();
  } catch (error) {
    console.error("Marks monitoring access error:", error);
    return res.status(500).json({ success: false, message: "Unable to verify access." });
  }
};
