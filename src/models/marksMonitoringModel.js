const { query, connectionQuery } = require("../utils/db.js");

const applyScope = (scope, teacherid, params) => {
  if (scope !== "hod") return "";
  params.push(teacherid);
  return ` 
      AND EXISTS (
        SELECT 1 FROM subjects hsu
        JOIN department hd ON hd.departmentid = hsu.departmentid
    	  JOIN hod_appointment ha ON ha.departmentid = hd.departmentid
        WHERE hsu.subjectcode = cs.subjectcode AND ha.teacherid = ?
      )
  `;
};

exports.getFilters = async () => {
  const [years, terms, exams, departments] = await Promise.all([
    query(
      `SELECT schoolyearid, yearname FROM schoolyear ORDER BY schoolyearid ASC`,
    ),
    query(`
      SELECT t.termid, t.termnumber, t.termname,
             t.yearid AS schoolyearid, sy.yearname
      FROM terms t
      JOIN schoolyear sy ON sy.schoolyearid = t.yearid
      ORDER BY sy.schoolyearid ASC, t.termnumber ASC
    `),
    query(`
      SELECT examid, exam_title, status, marks_open_at, marks_deadline
      FROM exams ORDER BY examid ASC
    `),
    query(
      `SELECT departmentid, departmentname FROM department ORDER BY departmentname ASC`,
    ),
  ]);
  return { years, terms, exams, departments };
};

exports.getSummary = async ({
  yearid,
  termid,
  examid,
  scope,
  teacherid,
  departmentid,
}) => {
  const params = [termid, yearid, examid];
  let filters = "";
  if (departmentid) {
    filters += " AND su.departmentid = ?";
    params.push(departmentid);
  }
  filters += applyScope(scope, teacherid, params);

  const rows = await query(
    `
    SELECT
      COUNT(*) AS total_subjects,
      SUM(x.entered_count = x.expected_count AND x.expected_count > 0) AS complete_subjects,
      SUM(x.entered_count > 0 AND x.entered_count < x.expected_count) AS in_progress_subjects,
      SUM(x.entered_count = 0 AND x.expected_count > 0) AS not_started_subjects,
      SUM(x.expected_count - x.entered_count) AS missing_marks,
      SUM(x.expected_count) AS expected_marks,
      SUM(x.entered_count) AS entered_marks
    FROM (
      SELECT
        cs.class_subject_id,
        COUNT(DISTINCT sc.studentclassid) AS expected_count,
        COUNT(DISTINCT sr.studentclassid) AS entered_count
      FROM class_subjects cs
      JOIN class c ON c.classid = cs.classid
      JOIN subjects su ON su.subjectcode = cs.subjectcode
      JOIN studentclass sc
        ON sc.classid = c.classid
       AND sc.termid = ?
       AND sc.yearid = ?
      LEFT JOIN student_results sr
        ON sr.studentclassid = sc.studentclassid
       AND sr.subjectcode = cs.subjectcode
       AND sr.examid = ?
      WHERE 1=1 ${filters}
      GROUP BY cs.class_subject_id
    ) x
  `,
    params,
  );

  const k = rows[0] || {};
  const expected = Number(k.expected_marks || 0);
  const entered = Number(k.entered_marks || 0);
  return {
    totalSubjects: Number(k.total_subjects || 0),
    completeSubjects: Number(k.complete_subjects || 0),
    inProgressSubjects: Number(k.in_progress_subjects || 0),
    notStartedSubjects: Number(k.not_started_subjects || 0),
    missingMarks: Number(k.missing_marks || 0),
    expectedMarks: expected,
    enteredMarks: entered,
    completionPercentage: expected
      ? Number(((entered * 100) / expected).toFixed(1))
      : 0,
  };
};

exports.getMonitoringRows = async ({
  yearid,
  termid,
  examid,
  scope,
  teacherid,
  departmentid,
  classid,
  status,
}) => {
  const params = [termid, yearid, examid, examid];
  let filters = "";
  if (departmentid) {
    filters += " AND su.departmentid = ?";
    params.push(departmentid);
  }
  if (classid) {
    filters += " AND c.classid = ?";
    params.push(classid);
  }
  filters += applyScope(scope, teacherid, params);

  const rows = await query(
    `
    SELECT
      cs.class_subject_id, 
      c.classid, 
      c.class, 
      yl.levelname,
      cs.subjectcode, 
      su.subjectname, 
      su.departmentid, 
      d.departmentname,
      ta.teacherid, 
      CONCAT(t.fname, ' ', t.lname) AS teacher_name,
      ex.examid, ex.exam_title, ex.marks_deadline,
      COUNT(DISTINCT sc.studentclassid) AS expected_marks,
      COUNT(DISTINCT sr.studentclassid) AS entered_marks
    FROM class_subjects cs
    JOIN class c ON c.classid = cs.classid
    JOIN yearlevel yl 
      ON yl.levelorder = c.levelid
    JOIN subjects su ON su.subjectcode = cs.subjectcode
    JOIN department d ON d.departmentid = su.departmentid
    JOIN studentclass sc
      ON sc.classid = c.classid
     AND sc.termid = ?
     AND sc.yearid = ?
    LEFT JOIN teaching_allocations ta ON ta.class_subject_id = cs.class_subject_id
    LEFT JOIN teachers t ON t.teacherid = ta.teacherid
    JOIN exams ex ON ex.examid = ?
    LEFT JOIN student_results sr
      ON sr.studentclassid = sc.studentclassid
     AND sr.subjectcode = cs.subjectcode
     AND sr.examid = ?
    WHERE 1=1 ${filters}
    GROUP BY cs.class_subject_id, c.classid, c.class, yl.levelname,
             cs.subjectcode, su.subjectname, su.departmentid,
             d.departmentname, ta.teacherid, t.fname, t.lname,
             ex.examid, ex.exam_title, ex.marks_deadline
    ORDER BY d.departmentname, c.class, yl.levelname, su.subjectname
  `,
    params,
  );

  const now = Date.now();
  return rows
    .map((row) => {
      const expected = Number(row.expected_marks || 0);
      const entered = Number(row.entered_marks || 0);
      const missing = Math.max(expected - entered, 0);
      const completion = expected
        ? Number(((entered * 100) / expected).toFixed(1))
        : 0;
      let completion_status = "NOT_STARTED";
      if (expected > 0 && entered === expected) completion_status = "COMPLETE";
      else if (entered > 0) completion_status = "IN_PROGRESS";
      if (
        completion_status !== "COMPLETE" &&
        row.marks_deadline &&
        new Date(row.marks_deadline).getTime() < now
      ) {
        completion_status = "OVERDUE";
      }
      return {
        ...row,
        expected_marks: expected,
        entered_marks: entered,
        missing_marks: missing,
        completion_percentage: completion,
        completion_status,
      };
    })
    .filter((row) => !status || row.completion_status === status);
};

exports.getClasses = async ({
  yearid,
  termid,
  scope,
  teacherid,
  departmentid,
}) => {
  const params = [termid, yearid];
  let filters = "";
  if (departmentid) {
    filters += " AND su.departmentid = ?";
    params.push(departmentid);
  }
  filters += applyScope(scope, teacherid, params);
  await query(
    `
    SELECT DISTINCT c.classid, c.class, yl.levelname
FROM class c
JOIN yearlevel yl 
	ON yl.levelorder = c.levelid
JOIN class_subjects cs 
    ON cs.classid = c.classid
JOIN subjects su ON su.subjectcode = cs.subjectcode
WHERE EXISTS (
	SELECT 1 FROM studentclass sc
	WHERE sc.classid = c.classid AND sc.termid = ? AND sc.yearid = ?
    ) ${filters}
    ORDER BY c.class, yl.levelname
  `,
    params,
  );
};

exports.getMissingLearners = async ({
  class_subject_id,
  examid,
  termid,
  yearid,
  scope,
  teacherid,
}) => {
  const params = [examid, examid, termid, yearid, class_subject_id];
  let hodFilter = "";
  if (scope === "hod") {
    hodFilter = `
      AND EXISTS (
        SELECT 1 FROM subjects hsu
        JOIN department hd ON hd.departmentid = hsu.departmentid
    	  JOIN hod_appointment ha ON ha.departmentid = hd.departmentid
        WHERE hsu.subjectcode = cs.subjectcode AND ha.teacherid = ?
      )
    `;
    params.push(teacherid);
  }
  const rows = await query(
    `
    SELECT 
      sc.studentclassid, 
      s.examno, 
      s.fname, 
      s.middlename, 
      s.lname, 
      s.gender,
      c.class, 
      yl.levelname, 
      cs.subjectcode, 
      su.subjectname, 
      ex.examid, 
      ex.exam_title
    FROM studentclass sc
    JOIN students s ON s.examno = sc.examno
    JOIN class c ON c.classid = sc.classid
    JOIN yearlevel yl ON c.levelid = yl.levelorder
    JOIN class_subjects cs ON cs.classid = c.classid
    JOIN subjects su ON su.subjectcode = cs.subjectcode
    JOIN exams ex ON ex.examid = ?
    LEFT JOIN student_results sr
    ON sr.studentclassid = sc.studentclassid
    AND sr.subjectcode = cs.subjectcode
    AND sr.examid = ?
    WHERE sc.termid = ?
    AND sc.yearid = ?
    AND cs.class_subject_id = ?
    AND sr.studentclassid IS NULL
    ${hodFilter}
    ORDER BY s.fname, s.lname
  `,
    params,
  );
  return rows;
};

exports.getInterventions = async ({
  class_subject_id,
  examid,
  termid,
  yearid,
  status,
}) => {
  const params = [class_subject_id, examid, termid, yearid];
  const statusSql = status ? " AND mi.status = ?" : "";
  if (status) params.push(status);
  query(
    `
    SELECT mi.*, CONCAT(COALESCE(t.fname,''),' ',COALESCE(t.lname,'')) AS teacher_name,
           CONCAT(COALESCE(cb.fname,''),' ',COALESCE(cb.lname,'')) AS created_by_name
    FROM marks_interventions mi
    LEFT JOIN teachers t ON t.teacherid = mi.teacherid
    JOIN teachers cb ON cb.teacherid = mi.created_by
    WHERE mi.class_subject_id = ? AND mi.examid = ? AND mi.termid = ? AND mi.yearid = ?
    ${statusSql}
    ORDER BY mi.created_at DESC
  `,
    params,
  );
};

exports.createIntervention = async (data) =>
  query(
    `
    INSERT INTO marks_interventions
      (class_subject_id, examid, termid, yearid, teacherid, created_by,
       intervention_type, message, due_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      data.class_subject_id,
      data.examid,
      data.termid,
      data.yearid,
      data.teacherid || null,
      data.created_by,
      data.intervention_type || "reminder",
      data.message,
      data.due_at || null,
    ],
  );

exports.updateIntervention = async ({ intervention_id, status }) => {
  let sql = `UPDATE marks_interventions SET status = ?`;
  const params = [status];
  if (status === "acknowledged") sql += ", acknowledged_at = CURRENT_TIMESTAMP";
  if (status === "resolved") sql += ", resolved_at = CURRENT_TIMESTAMP";
  sql += " WHERE intervention_id = ?";
  params.push(intervention_id);
  query(sql, params);
};

exports.updateExamDeadline = async ({
  examid,
  marks_open_at,
  marks_deadline,
}) =>
  query(
    `
    UPDATE exams SET marks_open_at = ?, marks_deadline = ? WHERE examid = ?
  `,
    [marks_open_at || null, marks_deadline || null, examid],
  );
