const model = require("../models/marksMonitoringModel");

const scope = req => req.marksMonitoringRole || (String(req.user?.usertype || "").toLowerCase() === "admin" ? "admin" : "hod");
const teacherId = req => req.user?.teacherid;
const pageError = (res, message, code = 500) => res.status(code).render("./response/response", { message });

exports.page = async (req, res) => {
  try {
    const filters = await model.getFilters();
    const isAdmin = scope(req) === "admin";
    return res.render("./exam/marksMonitoring", {
      ...filters,
      monitoringScope: scope(req),
      isAdmin,
      user: req.user
    });
  } catch (error) {
    console.error("Marks monitoring page error:", error);
    return pageError(res, "Unable to load marks monitoring.");
  }
};

exports.summary = async (req, res) => {
  try {
    const { yearid, termid, examid, departmentid } = req.query;
    if (!yearid || !termid || !examid) return res.status(400).json({ success: false, message: "Academic year, term and examination are required." });
    const data = await model.getSummary({ yearid, termid, examid, scope: scope(req), teacherid: teacherId(req), departmentid: departmentid || null });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Marks monitoring summary error:", error);
    return res.status(500).json({ success: false, message: "Unable to calculate marks completion summary." });
  }
};

exports.rows = async (req, res) => {
  try {
    const { yearid, termid, examid, departmentid, classid, status } = req.query;
    if (!yearid || !termid || !examid) return res.status(400).json({ success: false, message: "Academic year, term and examination are required." });
    const data = await model.getMonitoringRows({ yearid, termid, examid, scope: scope(req), teacherid: teacherId(req), departmentid: departmentid || null, classid: classid || null, status: status || null });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Marks monitoring rows error:", error);
    return res.status(500).json({ success: false, message: "Unable to load marks monitoring data." });
  }
};

exports.classes = async (req, res) => {
  try {
    const { yearid, termid, departmentid } = req.query;
    if (!yearid || !termid) return res.status(400).json({ success: false, message: "Academic year and term are required." });
    const data = await model.getClasses({ yearid, termid, scope: scope(req), teacherid: teacherId(req), departmentid: departmentid || null });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Marks monitoring classes error:", error);
    return res.status(500).json({ success: false, message: "Unable to load classes." });
  }
};

exports.missingLearners = async (req, res) => {
  try {
    const { class_subject_id, examid, termid, yearid } = req.query;
    if (!class_subject_id || !examid || !termid || !yearid) return res.status(400).json({ success: false, message: "Class subject, examination, term and year are required." });
    const data = await model.getMissingLearners({ class_subject_id, examid, termid, yearid, scope: scope(req), teacherid: teacherId(req) });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Missing marks learners error:", error);
    return res.status(500).json({ success: false, message: "Unable to load learners with missing marks." });
  }
};

exports.interventions = async (req, res) => {
  try {
    const data = await model.getInterventions(req.query);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Interventions error:", error);
    return res.status(500).json({ success: false, message: "Unable to load interventions." });
  }
};

exports.createIntervention = async (req, res) => {
  try {
    const created_by = teacherId(req);
    const { class_subject_id, examid, termid, yearid, teacherid, intervention_type, message, due_at } = req.body;
    if (!class_subject_id || !examid || !termid || !yearid || !message) return res.status(400).json({ success: false, message: "Required intervention information is missing." });
    const data = await model.createIntervention({ class_subject_id, examid, termid, yearid, teacherid, created_by, intervention_type, message, due_at });
    return res.status(201).json({ success: true, message: "Intervention recorded successfully.", data });
  } catch (error) {
    console.error("Create intervention error:", error);
    return res.status(500).json({ success: false, message: "Unable to create intervention." });
  }
};

exports.updateIntervention = async (req, res) => {
  try {
    const { intervention_id, status } = req.body;
    if (!intervention_id || !["open", "acknowledged", "resolved"].includes(status)) return res.status(400).json({ success: false, message: "Invalid intervention update." });
    const updated = await model.updateIntervention({ intervention_id, status });
    if (!updated) return res.status(404).json({ success: false, message: "Intervention not found." });
    return res.json({ success: true, message: "Intervention updated." });
  } catch (error) {
    console.error("Update intervention error:", error);
    return res.status(500).json({ success: false, message: "Unable to update intervention." });
  }
};

exports.updateDeadline = async (req, res) => {
  try {
    if (scope(req) !== "admin") return res.status(403).json({ success: false, message: "Only administrators may change examination deadlines." });
    const { examid, marks_open_at, marks_deadline } = req.body;
    if (!examid) return res.status(400).json({ success: false, message: "Examination is required." });
    const updated = await model.updateExamDeadline({ examid, marks_open_at, marks_deadline });
    if (!updated) return res.status(404).json({ success: false, message: "Examination not found." });
    return res.json({ success: true, message: "Marks deadline updated." });
  } catch (error) {
    console.error("Update deadline error:", error);
    return res.status(500).json({ success: false, message: "Unable to update marks deadline." });
  }
};
