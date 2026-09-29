// routes/reportCards.js
const express = require("express");
const puppeteer = require("puppeteer");
// const path = require("path")
// const fileURLToPath = require("url");
const { ensureRole } = require('../middleware/authChecker.js');
const { authChecker } = require('../middleware/authChecker.js');

const service = require("../services/reportCardService.js");
 
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default function reportCardRoutes({ db, authChecker }) {
  const router = express.Router();

  const adminOnly = [authChecker, ensureRole('admin')];
  /* ---------------------------------------------------------
     Reusable: render an EJS view to HTML (via res.render callback)
     --------------------------------------------------------- */
  function renderView(res, view, data) {
    return new Promise((resolve, reject) => {
      res.render(view, data, (err, html) => (err ? reject(err) : resolve(html)));
    });
  }

  /* ---------------------------------------------------------
     Reusable: convert HTML → PDF buffer
     --------------------------------------------------------- */
  async function htmlToPdf(html) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      // Inline CSS is already in the HTML; wait for fonts/images
      await page.emulateMediaType("print");
      return await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" },
        preferCSSPageSize: true,
      });
    } finally {
      await browser.close();
    }
  }

  /* ---------------------------------------------------------
     GET /admin/report-cards  → generation panel
     --------------------------------------------------------- */
  router.get("/admin/report-cards", ...adminOnly, async (req, res) => {
    try {
      const lookups = await service.getLookups();
      res.render("./reportCards/generate", { ...lookups, user: req.user });
    } catch (err) {
      console.error("report-cards lookup failed:", err);
      res.status(500).render("./response/response", { message: "Database error." });
    }
  });

  /* ---------------------------------------------------------
     POST /admin/report-cards/preview  → JSON for UI preview
     --------------------------------------------------------- */
  router.post("/admin/report-cards/preview", ...adminOnly, async (req, res) => {
    
    const { levelorder, examid, termid, schoolyearid, examno } = req.body;
    if (!levelorder || !examid || !termid || !schoolyearid) {
      return res.status(400).json({ success: false, message: "Missing fields." });
    }

    try {
      if (examno) {
        const card = await service.getReportCard({ examno, examid, termid, schoolyearid, levelorder });
        if (!card) return res.status(404).json({ success: false, message: "No report card found." });
        return res.json({ success: true, count: 1, cards: [card] });
      }
      const cards = await service.getBulkReportCards({ levelorder, examid, termid, schoolyearid });
      if (!cards.length) return res.status(404).json({ success: false, message: "No students found." });
      return res.json({ success: true, count: cards.length, cards });
    } catch (err) {
      console.error("preview failed:", err);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  });

  /* ---------------------------------------------------------
     POST /admin/report-cards/pdf  → download PDF (single or bulk)
     --------------------------------------------------------- */
  router.post("/admin/report-cards/pdf", ...adminOnly, async (req, res) => {
    const { levelorder, examid, termid, schoolyearid, examno } = req.body;
    try {
      let cards;
      if (examno) {
        const single = await service.getReportCard({ examno, examid, termid, schoolyearid, levelorder });
        if (!single) return res.status(404).render("./response/response", { message: "No report card found." });
        cards = [single];
      } else {
        cards = await service.getBulkReportCards({ levelorder, examid, termid, schoolyearid });
        if (!cards.length) return res.status(404).render("./response/response", { message: "No students found." });
      }

      const html = await renderView(res, "./reportCards/bulk", {
        cards,
        schoolName: "Milenge Boarding Secondary School",
        ministry: "Ministry of Education",
        logoPath: "/images/logo.png",
        ministryLogoPath: "/images/ministryLogo.png",
      });

      const pdf = await htmlToPdf(html);

      const filename = cards.length === 1
        ? `report-card-${cards[0].student.examno}.pdf`
        : `report-cards-class-${levelorder}-term-${termid}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdf.length);
      return res.end(pdf);
    } catch (err) {
      console.error("pdf generation failed:", err);
      return res.status(500).render("./response/response", { message: "PDF generation failed." });
    }
  });

  /* ---------------------------------------------------------
     GET /parent/report-card  → parent-facing lookup
     ---------------------------------------------------------
     Parents authenticate (authChecker) and supply their child's
     examno + the term they want to view.
     --------------------------------------------------------- */
  router.get("/parent/report-card", authChecker, async (req, res) => {
    if (req.user.usertype !== "Parent") {
      return res.status(403).render("./response/response", { message: "Access denied." });
    }
    const { examno, examid, termid, schoolyearid } = req.query;
    if (!examno || !examid || !termid || !schoolyearid) {
      return res.status(400).render("./response/response", { message: "Missing query parameters." });
    }
    // TODO: verify examno belongs to this parent
    try {
      const card = await service.getReportCard({ examno, examid, termid, schoolyearid });
      if (!card) return res.status(404).render("./response/response", { message: "No report card found." });
      res.render("./reportCards/single", {
        card,
        schoolName: "Milenge Boarding Secondary School",
        ministry: "Ministry of Education",
        logoPath: "/images/logo.png",
        ministryLogoPath: "/images/ministryLogo.png",
        mode: "view",
      });
    } catch (err) {
      console.error("parent view failed:", err);
      res.status(500).render("./response/response", { message: "Server error." });
    }
  });

  /* ---------------------------------------------------------
     GET /parent/report-card/pdf  → parent PDF download
     --------------------------------------------------------- */
  router.get("/parent/report-card/pdf", authChecker, async (req, res) => {
    if (req.user.usertype !== "Parent") {
      return res.status(403).render("./response/response", { message: "Access denied." });
    }
    const { examno, examid, termid, schoolyearid } = req.query;
    try {
      const card = await service.getReportCard({ examno, examid, termid, schoolyearid });
      if (!card) return res.status(404).render("./response/response", { message: "No report card found." });

      const html = await renderView(res, "./reportCards/bulk", {
        cards: [card],
        schoolName: "Milenge Boarding Secondary School",
        ministry: "Ministry of General Education",
        logoPath: "/images/logo.png",
        ministryLogoPath: "/images/ministryLogo.png",
      });

      const pdf = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="report-card-${examno}.pdf"`);
      return res.end(pdf);
    } catch (err) {
      console.error("parent pdf failed:", err);
      res.status(500).render("./response/response", { message: "Server error." });
    }
  });

  module.exports = router;
// }