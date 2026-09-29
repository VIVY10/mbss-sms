const axios = require("axios");
const { randomUUID } = require("crypto");

const model = require("../models/smsModel.js");

async function getResultFormData() {
  const [schoolyear, term, yearlevel, exam] = await Promise.all([
    model.getSchoolYears(),
    model.getTerms(),
    model.getYearLevels(),
    model.getExams(),
  ]);

  return {
    schoolyear,
    term,
    yearlevel,
    exam,
  };
}

function groupByStudent(results) {
  // console.log(results)

  const pupilResults = {};

  results.forEach((row) => {
    if (!pupilResults[row.examno]) {
      pupilResults[row.examno] = {
        student: {
          examno: row.examno,
          fname: row.fname,
          lname: row.lname,
          exam_title: row.exam_title,
          yearname: row.yearname,
          term: row.termname,
          parentPrimaryPhoneNumber: row.phonenumber,
          parentSecondaryPhoneNumber: row.g.guardian_alt_phone,
        },
        subjects: [],
      };
    }
    pupilResults[row.examno].subjects.push({
      subjectcode: row.subjectcode,
      subjectname: row.subjectname,
      score: row.score,
    });
  });

  return pupilResults;
}

function buildMessage({ student, subjects }) {
  const details = subjects
    .map((subject) => `${subject.subjectname} ${subject.score};`)
    .join(" ");

  return (
    `Milenge Boarding Secondary School. ` +
    `${student.term} ${student.exam_title} test results. ` +
    `${student.fname} ${student.lname}; ` +
    `${details} ` +
    `Year: ${student.yearname}`
  );
}

async function pushbulletRequest(path, payload, accessToken) {
  const res = await fetch(`https://api.pushbullet.com/v2${path}`, {
    method: "POST",
    headers: {
      "Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Pushbullet ${res.status}: ${data?.error?.message || res.statusText}`,
    );
  }
  res.status(200).send('SMS sent successfully!');
}


async function sendStudentResults(rows, { targetDeviceIden, accessToken }) {
  const groups = groupByStudent(rows);

  for (const record of Object.values(groups)) {
    const phone = [];

    const primary = record?.student?.parentPrimaryPhoneNumber;
    const secondary = record?.student?.parentSecondaryPhoneNumber;

    if (typeof primary === "string" && primary.trim()) {
      phone.push(`+26${primary.trim()}`);
    }

    if (typeof secondary === "string" && secondary.trim()) {
      phone.push(`+26${secondary.trim()}`);
    }

    const message = buildMessage(record);

    // send message
    await pushbulletRequest("/texts", {
      addresses: [phone],
      message,
      target_device_iden: targetDeviceIden,
      guid: randomUUID(),
    },
    accessToken
);
  }
}

module.exports = {
  getResultFormData,
  sendStudentResults,
};
