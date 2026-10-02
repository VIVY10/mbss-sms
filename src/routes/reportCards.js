// routes/reportCards.js
const express = require("express");

// ✅ Two separate services, two separate imports
const { createReportCardService } = require("../services/reportCardService.js");
const { buildReportCardPdf } = require("../services/reportCardPdf.js");

const { authChecker, ensureRole } = require("../middleware/authChecker.js");

const router = express.Router();

/* ---------------------------------------------------------
   Middleware bundle: authenticated + admin role
   --------------------------------------------------------- */
const adminOnly = [authChecker, ensureRole("admin")];

/* ---------------------------------------------------------
   Instantiate the service 
   --------------------------------------------------------- */
const service = createReportCardService();

/* =========================================================
   Admin: generation panel
   ========================================================= */
router.get("/admin/report-cards", adminOnly, async (req, res) => {
  try {
    const lookups = await service.getLookups();
    res.render("./reportCards/generate", { ...lookups, user: req.user });
  } catch (err) {
    console.error("report-cards lookup failed:", err);
    res
      .status(500)
      .render("./response/response", { message: "Database error." });
  }
});

/* =========================================================
   Admin: JSON preview (single or bulk)
   ========================================================= */
router.post("/admin/report-cards/preview", adminOnly, async (req, res) => {
  const { levelorder, examid, termid, schoolyearid, examno } = req.body;

  if (!levelorder || !examid || !termid || !schoolyearid) {
    return res.status(400).json({ success: false, message: "Missing fields." });
  }

  try {
    if (examno) {
      const card = await service.getReportCard({
        examno,
        examid,
        termid,
        schoolyearid,
        levelorder,
      });
      if (!card) {
        return res
          .status(404)
          .json({ success: false, message: "No report card found." });
      }
      return res.json({ success: true, count: 1, cards: [card] });
    }

    const cards = await service.getBulkReportCards({
      levelorder,
      examid,
      termid,
      schoolyearid,
    });
    if (!cards.length) {
      return res
        .status(404)
        .json({ success: false, message: "No students found." });
    }
    return res.json({ success: true, count: cards.length, cards });
  } catch (err) {
    console.error("preview failed:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

/* =========================================================
   Admin: download PDF
   ========================================================= */
router.post("/admin/report-cards/pdf", ...adminOnly, async (req, res) => {
  const { levelorder, examid, termid, schoolyearid, examno } = req.body;

  try {
    /* 1. Load one or many report cards */
    let cards;
    if (examno) {
      const single = await service.getReportCard({
        examno,
        examid,
        termid,
        schoolyearid,
        levelorder,
      });
      if (!single) {
        return res.status(404).render("./response/response", {
          message: "No report card found.",
        });
      }
      cards = [single];
    } else {
      cards = await service.getBulkReportCards({
        levelorder,
        examid,
        termid,
        schoolyearid,
      });
      if (!cards.length) {
        return res.status(404).render("./response/response", {
          message: "No students found.",
        });
      }
    }

    /* 2. Build the PDF (pdfkit — no Puppeteer) */
    const pdf = await buildReportCardPdf(cards, {
      schoolName: "Milenge Boarding Secondary School",
      ministry: "Ministry of Education",
    });
 
    /* 3. Send it */
    const filename =
      cards.length === 1
        ? `report-card-${cards[0].student.examno}.pdf`
        : `report-cards-level-${levelorder}-term-${termid}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdf.length);
    return res.end(pdf);
  } catch (err) {
    console.error("pdf generation failed:", err);
    return res.status(500).render("./response/response", {
      message: err.message,
    });
  }
});

/* ---------------------------------------------------------
     GET /parent/report-card  → parent-facing lookup
     ---------------------------------------------------------
     Parents authenticate (authChecker) and supply their child's
     examno + the term they want to view.
     --------------------------------------------------------- */
router.get("/parent/report-card", async (req, res) => {
  try {
    const lookups = await service.getLookups();
    res.render("./reportCards/parentGenerate", { ...lookups, user: req.user });
  } catch (err) {
    console.error("report-cards lookup failed:", err);
    res
      .status(500)
      .render("./response/response", { message: "Database error." });
  }
});

/* =========================================================
   Parent: JSON preview (single or bulk)
   ========================================================= */
router.post("/parent/report-card/preview", async (req, res) => {
  const { examid, termid, schoolyearid, examno } = req.body;

  if (!examno || !examid || !termid || !schoolyearid) {
    return res.status(400).json({ success: false, message: "Missing fields." });
  }

  try {
    if (examno) {
    const card = await service.getReportCard({
      examno,
      examid,
      termid,
      schoolyearid,
    });
      if (!card) {
        return res
          .status(404)
          .json({ success: false, message: "No report card found." });
      }
      return res.json({ success: true, count: 1, cards: [card] });
    }
    return res.json({ success: true, count: cards.length, cards });
  } catch (err) {
    console.error("preview failed:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

/* =========================================================
   Parent: download PDF
   ========================================================= */
router.post("/parent/report-card/pdf", async (req, res) => {
   const { examno, examid, termid, schoolyearid } = req.body;
     if (!examno || !examid || !termid || !schoolyearid) {
    return res
      .status(400)
      .render("./response/response", { message: "Missing query parameters." });
  }
  try {
    /* 1. Load one or many report cards */
    let cards;
    
      const single = await service.getReportCard({
            examno,
            examid,
            termid,
            schoolyearid,
          });
      if (!single) {
        return res.status(404).render("./response/response", {
          message: "No report card found.",
        });
      }
      cards = [single];

    /* 2. Build the PDF */
    const pdf = await buildReportCardPdf(cards, {
      schoolName: "Milenge Boarding Secondary School",
      ministry: "Ministry of Education",
    });
 
    /* 3. Send it */
    const filename =
      cards.length === 1
        ? `report-card-${cards[0].student.examno}.pdf`
        : `report-cards-level-${levelorder}-term-${termid}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdf.length);
    return res.end(pdf);
  } catch (err) {
    console.error("pdf generation failed:", err);
    return res.status(500).render("./response/response", {
      message: err.message,
    });
  }
});

module.exports = router;