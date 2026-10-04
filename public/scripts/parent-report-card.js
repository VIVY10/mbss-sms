"use strict";

(function () {
  const form = document.getElementById("rcForm");
  if (!form) return;

  const previewBtn  = document.getElementById("rcPreview");
  const downloadBtn = document.getElementById("rcDownload");
  const previewArea = document.getElementById("rcPreviewArea");
  const previewBox  = document.getElementById("rcPreviewContent");
  const statusEl    = document.getElementById("rcStatus");

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "rc-status rc-status--" + (type || "info");
    statusEl.hidden = false;
  }
  function clearStatus() {
    statusEl.hidden = true;
    statusEl.textContent = "";
  }

  function readForm() {
    const fd = new FormData(form);
    return {
      schoolyearid: fd.get("schoolyearid"),
      termid:       fd.get("termid"),
      examid:       fd.get("examid"),
      examno:       (fd.get("examno") || "").trim() || undefined,
    };
  }

  function validate(payload) {
    if (!payload.schoolyearid || !payload.termid || !payload.examno || !payload.examid) {
      showStatus("Please select school year, term, exam type and enter correct exam number.", "error");
      return false;
    }
    return true;
  }

  /* ---------------------------------------------------------
     Preview
     --------------------------------------------------------- */
  previewBtn.addEventListener("click", async () => {
    clearStatus();
    const payload = readForm();
    if (!validate(payload)) return;

    previewBtn.disabled = true;

    try {
      const res = await fetch("/parent/report-card/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Preview failed.");
      }

      renderPreview(data.cards);
      showStatus(
        `${data.count} report card${data.count === 1 ? "" : "s"} ready.`,
        "success"
      );
    } catch (err) {
      showStatus(err.message, "error");
      previewArea.hidden = true;
    } finally {
      previewBtn.disabled = false;
    }
  });

  /* ---------------------------------------------------------
     Download PDF
     --------------------------------------------------------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();
    const payload = readForm();
    if (!validate(payload)) return;

    downloadBtn.disabled = true;

    try {
      const res = await fetch("/parent/report-card/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "PDF generation failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = payload.examno
        ? `report-card-${payload.examno}.pdf`
        : `report-cards.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showStatus("PDF downloaded.", "success");
    } catch (err) {
      showStatus(err.message, "error");
    } finally {
      downloadBtn.disabled = false;
    }
  });

  /* ---------------------------------------------------------
     Preview renderer (safe DOM construction)
     --------------------------------------------------------- */
  function renderPreview(cards) {
    previewBox.replaceChildren();
    cards.forEach((card) => previewBox.appendChild(buildCardEl(card)));
    previewArea.hidden = false;
    previewArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function buildCardEl(card) {
    const wrap = el("div", "rc-preview-card");

    const header = el("div", "rc-preview-header");
    header.appendChild(el("h3", null, `${card.student.fname} ${card.student.lname}`));
    header.appendChild(
      el(
        "p",
        null,
        `Exam No. ${card.student.examno} · ${card.student.level}${card.student.className}`
      )
    );
    wrap.appendChild(header);

    const table = el("table", "rc-preview-table");
    const thead = el("thead");
    const trh = el("tr");
    ["Subject", "Score", "Grade", "Remarks"].forEach((h) =>
      trh.appendChild(el("th", null, h))
    );
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = el("tbody");
    card.subjects.forEach((s) => {
      const tr = el("tr");
      tr.appendChild(el("td", null, s.subjectname));
      tr.appendChild(el("td", "num", String(s.scoreDisplay)));
      tr.appendChild(el("td", null, s.grade));
      tr.appendChild(el("td", null, s.remark));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);

    const sum = el("div", "rc-preview-summary");
    sum.appendChild(el("span", null, `Average: ${card.summary.average}%`));
    sum.appendChild(el("span", null, `Overall: ${card.summary.overallGrade}`));
    sum.appendChild(el("span", null, `Status: ${card.summary.status}`));
    wrap.appendChild(sum);

    return wrap;
  }
})();