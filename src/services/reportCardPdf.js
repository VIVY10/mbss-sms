const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const COLORS = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  soft: "#f8fafc",
  header: "#f1f5f9",
  accent: "#1e3a8a",
  success: "#166534",
  danger: "#991b1b",
};

/* =========================================================
   IMAGE PATHS
   ========================================================= */

const logoFile = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "images",
  "logo.png"
);

const ministryLogoFile = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "images",
  "ministryLogo.png"
);

/* =========================================================
   EMBED IMAGES AS BUFFERS
   ========================================================= */

function loadImage(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`PDF image not found: ${filePath}`);
      return null;
    }

    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Failed to load PDF image: ${filePath}`, error);
    return null;
  }
}

const LOGO = loadImage(logoFile);
const MINISTRY_LOGO = loadImage(ministryLogoFile);

/* =========================================================
   PUBLIC API
   ========================================================= */

function buildReportCardPdf(cards, meta = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        autoFirstPage: true,
      });

      const chunks = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      if (!Array.isArray(cards) || cards.length === 0) {
        drawEmptyReport(doc, meta);
      } else {
        cards.forEach((card, index) => {
          if (index > 0) {
            doc.addPage();
          }

          drawCard(doc, card, meta);
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/* =========================================================
   REPORT CARD
   ========================================================= */

function drawCard(doc, card, meta) {
  const LEFT = 40;
  const RIGHT = doc.page.width - 40;
  const WIDTH = RIGHT - LEFT;

  drawHeader(doc, meta, LEFT, WIDTH, RIGHT);
  drawExamLine(doc, card, LEFT, WIDTH);
  drawStudentDetails(doc, card, LEFT, WIDTH);
  drawResultsTable(doc, card, LEFT, WIDTH);
  drawSummary(doc, card, LEFT, WIDTH);
  drawComment(doc, card, LEFT, WIDTH);
  drawSignatures(doc, LEFT, RIGHT);
}

/* =========================================================
   HEADER
   ========================================================= */

function drawHeader(doc, meta, LEFT, WIDTH, RIGHT) {
  const HEADER_TOP = 40;
  const HEADER_HEIGHT = 105;

  /* -------------------------------------------------------
     HEADER BORDER
     ------------------------------------------------------- */

  doc
    .rect(LEFT, HEADER_TOP, WIDTH, HEADER_HEIGHT)
    .lineWidth(0.8)
    .stroke(COLORS.ink);

  /* -------------------------------------------------------
     SCHOOL LOGO - LEFT
     ------------------------------------------------------- */

  if (LOGO) {
    try {
      doc.image(LOGO, LEFT + 12, HEADER_TOP + 20, {
        fit: [64, 64],
        align: "center",
        valign: "center",
      });
    } catch (error) {
      console.warn(
        "Could not embed school logo:",
        error.message
      );
    }
  }

  /* -------------------------------------------------------
     MINISTRY LOGO - RIGHT
     ------------------------------------------------------- */

  if (MINISTRY_LOGO) {
    try {
      doc.image(
        MINISTRY_LOGO,
        RIGHT - 76,
        HEADER_TOP + 20,
        {
          fit: [64, 64],
          align: "center",
          valign: "center",
        }
      );
    } catch (error) {
      console.warn(
        "Could not embed ministry logo:",
        error.message
      );
    }
  }

  /* -------------------------------------------------------
     CENTER TEXT AREA
     ------------------------------------------------------- */

  const TITLE_LEFT = LEFT + 80;
  const TITLE_WIDTH = WIDTH - 160;

  /*
   * 1. MINISTRY NAME
   *    Appears at the very top
   */

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(
      meta.ministry ||
        "MINISTRY OF EDUCATION",
      TITLE_LEFT,
      HEADER_TOP + 10,
      {
        width: TITLE_WIDTH,
        align: "center",
      }
    );

  /*
   * 2. SCHOOL NAME
   */

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(COLORS.ink)
    .text(
      meta.schoolName ||
        "SCHOOL NAME",
      TITLE_LEFT,
      HEADER_TOP + 30,
      {
        width: TITLE_WIDTH,
        align: "center",
      }
    );

  /*
   * 3. REPORT CARD
   */

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.accent)
    .text(
      "SCHOOL REPORT CARD",
      TITLE_LEFT,
      HEADER_TOP + 57,
      {
        width: TITLE_WIDTH,
        align: "center",
      }
    );

  /*
   * 4. Optional academic information
   */

  if (meta.address) {
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        meta.address,
        TITLE_LEFT,
        HEADER_TOP + 76,
        {
          width: TITLE_WIDTH,
          align: "center",
        }
      );
  }

  /* -------------------------------------------------------
     MOVE CURSOR BELOW HEADER
     ------------------------------------------------------- */

  doc.y =
    HEADER_TOP +
    HEADER_HEIGHT +
    14;
}

/* =========================================================
   EXAM / TERM LINE
   ========================================================= */

function drawExamLine(doc, card, LEFT, WIDTH) {
  const student = card.student || {};

  const examTitle = student.exam_title || "—";
  const term = student.termnumber || "—";
  const year = student.yearname || "—";

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(
      `Results of ${examTitle}   ·   Term ${term}   ·   ${year}`,
      LEFT,
      doc.y,
      {
        width: WIDTH,
        align: "center",
      }
    );

  doc.moveDown(1);
}

/* =========================================================
   STUDENT DETAILS
   ========================================================= */

function drawStudentDetails(doc, card, LEFT, WIDTH) {
  const student = card.student || {};

  const y0 = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.ink);

  doc.text(
    `Exam No.: ${student.examno || "—"}`,
    LEFT,
    y0,
    {
      width: WIDTH / 2,
    }
  );

  const classText =
    `${student.level || ""}${student.className || ""}`.trim() || "—";

  doc.text(
    `Class: ${classText}`,
    LEFT + (WIDTH * 2) / 3,
    y0,
    {
      width: WIDTH / 2,
    }
  );

  const y1 = y0 + 16;

  const fullName =
    `${student.lname || ""} ${student.fname || ""}`.trim() || "—";

  doc.text(
    `Name: ${fullName}`,
    LEFT,
    y1,
    {
      width: (WIDTH * 2) / 3,
    }
  );

  doc.text(
    `Gender: ${student.gender || "—"}`,
    LEFT + (WIDTH * 2) / 3,
    y1,
    {
      width: WIDTH / 3,
    }
  );

  doc.y = y1 + 26;
}

/* =========================================================
   RESULTS TABLE
   ========================================================= */

function drawResultsTable(doc, card, LEFT, WIDTH) {
  const ROW_H = 20;

  const colX = [
    LEFT,
    LEFT + 220,
    LEFT + 280,
    LEFT + 340,
    LEFT + 400,
    LEFT + WIDTH,
  ];

  const headers = [
    "Subject",
    "Marks",
    "Total",
    "Grade",
    "Remarks",
  ];

  let y = doc.y;

  /* Header */
  doc
    .rect(LEFT, y, WIDTH, ROW_H)
    .fillAndStroke(COLORS.header, COLORS.line);

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#334155");

  headers.forEach((header, index) => {
    const align =
      index >= 1 && index <= 2
        ? "right"
        : "left";

    const pad =
      align === "right"
        ? 6
        : 4;

    doc.text(
      header,
      colX[index] + pad,
      y + 6,
      {
        width:
          colX[index + 1] -
          colX[index] -
          pad -
          4,
        align,
      }
    );
  });

  y += ROW_H;

  /* Rows */
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.ink);

  const subjects = Array.isArray(card.subjects)
    ? card.subjects
    : [];

  subjects.forEach((subject) => {
    doc
      .rect(LEFT, y, WIDTH, ROW_H)
      .stroke(COLORS.line);

    doc.text(
      subject.subjectname || "—",
      colX[0] + 4,
      y + 6,
      {
        width:
          colX[1] -
          colX[0] -
          8,
      }
    );

    doc.text(
      String(
        subject.scoreDisplay ??
        subject.score ??
        "—"
      ),
      colX[1] + 4,
      y + 6,
      {
        width:
          colX[2] -
          colX[1] -
          10,
        align: "right",
      }
    );

    doc.text(
      "100",
      colX[2] + 4,
      y + 6,
      {
        width:
          colX[3] -
          colX[2] -
          10,
        align: "right",
      }
    );

    doc.text(
      subject.grade || "—",
      colX[3] + 4,
      y + 6,
      {
        width:
          colX[4] -
          colX[3] -
          8,
      }
    );

    doc.text(
      subject.remark || "—",
      colX[4] + 4,
      y + 6,
      {
        width:
          colX[5] -
          colX[4] -
          8,
      }
    );

    y += ROW_H;
  });

  /* Total row */
  const summary = card.summary || {};

  doc
    .rect(LEFT, y, WIDTH, ROW_H)
    .fillAndStroke(
      COLORS.soft,
      COLORS.line
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.ink);

  doc.text(
    "Total",
    colX[0] + 4,
    y + 6,
    {
      width:
        colX[1] -
        colX[0] -
        8,
    }
  );

  doc.text(
    String(summary.totalScore ?? "—"),
    colX[1] + 4,
    y + 6,
    {
      width:
        colX[2] -
        colX[1] -
        10,
      align: "right",
    }
  );

  doc.text(
    String(summary.maxScore ?? "—"),
    colX[2] + 4,
    y + 6,
    {
      width:
        colX[3] -
        colX[2] -
        10,
      align: "right",
    }
  );

  y += ROW_H;

  doc.y = y + 14;
}

/* =========================================================
   SUMMARY
   ========================================================= */

function drawSummary(doc, card, LEFT, WIDTH) {
  const summary = card.summary || {};

  const items = [
    {
      label: "Average",
      value: `${summary.average ?? "—"}%`,
    },
    {
      label: "Overall Grade",
      value: summary.overallGrade || "—",
    },
    {
      label: "Subjects Passed",
      value: `${summary.subjectsPassed ?? "—"}/${summary.totalSubjects ?? "—"}`,
    },
    {
      label: "Position",
      value: summary.position ?? "—",
    },
  ];

  const BOX_H = 44;
  const GAP = 8;

  const BOX_W =
    (WIDTH - GAP * (items.length - 1)) /
    items.length;

  let x = LEFT;
  const y = doc.y;

  items.forEach((item) => {
    doc
      .rect(x, y, BOX_W, BOX_H)
      .stroke(COLORS.line);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        item.label.toUpperCase(),
        x + 6,
        y + 6,
        {
          width: BOX_W - 12,
        }
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLORS.accent)
      .text(
        String(item.value),
        x + 6,
        y + 20,
        {
          width: BOX_W - 12,
        }
      );

    x += BOX_W + GAP;
  });

  doc.y = y + BOX_H + 14;
}

/* =========================================================
   COMMENTS / STATUS
   ========================================================= */

function drawComment(doc, card, LEFT, WIDTH) {
  const summary = card.summary || {};

  const BOX_H = 46;
  const GAP = 8;

  const LEFT_W = WIDTH * 0.66;
  const RIGHT_W =
    WIDTH - LEFT_W - GAP;

  const y = doc.y;

  /* Teacher comment */
  doc
    .rect(LEFT, y, LEFT_W, BOX_H)
    .stroke(COLORS.line);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      "CLASS TEACHER'S COMMENT",
      LEFT + 6,
      y + 6,
      {
        width: LEFT_W - 12,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(
      summary.teacherComment || "—",
      LEFT + 6,
      y + 20,
      {
        width: LEFT_W - 12,
        height: BOX_H - 24,
        ellipsis: true,
      }
    );

  /* Status */
  const xRight =
    LEFT + LEFT_W + GAP;

  doc
    .rect(xRight, y, RIGHT_W, BOX_H)
    .stroke(COLORS.line);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      "STATUS",
      xRight + 6,
      y + 6,
      {
        width: RIGHT_W - 12,
      }
    );

  const status =
    summary.status || "—";

  const statusColor =
    String(status).toLowerCase() ===
    "promoted"
      ? COLORS.success
      : COLORS.danger;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(statusColor)
    .text(
      status,
      xRight + 6,
      y + 20,
      {
        width: RIGHT_W - 12,
      }
    );

  doc.y = y + BOX_H + 36;
}

/* =========================================================
   SIGNATURES
   ========================================================= */

function drawSignatures(doc, LEFT, RIGHT) {
  const y = doc.y;

  /* Class teacher */
  doc
    .moveTo(LEFT, y)
    .lineTo(LEFT + 200, y)
    .stroke(COLORS.ink);

  /* Head teacher */
  doc
    .moveTo(RIGHT - 200, y)
    .lineTo(RIGHT, y)
    .stroke(COLORS.ink);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(
      "Class Teacher's Signature",
      LEFT,
      y + 4,
      {
        width: 200,
        align: "center",
      }
    );

  doc.text(
    "Head Teacher's Signature",
    RIGHT - 200,
    y + 4,
    {
      width: 200,
      align: "center",
    }
  );
}

/* =========================================================
   EMPTY REPORT
   ========================================================= */

function drawEmptyReport(doc, meta) {
  const LEFT = 40;
  const WIDTH =
    doc.page.width - 80;

  drawHeader(
    doc,
    meta,
    LEFT,
    WIDTH,
    doc.page.width - 40
  );

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.muted)
    .text(
      "No report cards available.",
      LEFT,
      doc.y + 30,
      {
        width: WIDTH,
        align: "center",
      }
    );
}

/* =========================================================
   PUBLIC EXPORT
   ========================================================= */

module.exports = {
  buildReportCardPdf,
};