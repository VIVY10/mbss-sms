const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const model = require('../models/smsModel.js');


async function getResultFormData() {
    const [
        schoolyear,
        term,
        yearlevel,
        exam
    ] = await Promise.all([
        model.getSchoolYears(),
        model.getTerms(),
        model.getYearLevels(),
        model.getExams()
    ]);

    return {
        schoolyear,
        term,
        yearlevel,
        exam
    };
}


const getResults = model.getResults;


function groupByStudent(rows) {
    return rows.reduce((groups, row) => {

        groups[row.examno] ??= {
            student: {
                examno: row.examno,
                fname: row.fname,
                lname: row.lname,
                exam_title: row.exam_title,
                yearname: row.yearname,
                term: row.termnumber,
                parentPhoneNumbers: row.phonenumber
            },
            subjects: []
        };

        groups[row.examno].subjects.push({
            subjectcode: row.subjectcode,
            subjectname: row.subjectname,
            score: row.score
        });

        return groups;

    }, {});
}


function buildMessage({ student, subjects }) {
    const details = subjects
        .map(
            subject =>
                `${subject.subjectname} (${subject.subjectcode}): ${subject.score};`
        )
        .join(' ');

    return (
        `Milenge Boarding Secondary School. ` +
        `term ${student.term} ${student.exam_title} Results. ` +
        `${student.fname} ${student.lname}; ` +
        `${details} ` +
        `Year: ${student.yearname}`
    );
}


async function sendStudentResults(
    rows,
    { targetDeviceIden, accessToken }
) {
    const groups = groupByStudent(rows);

    for (const record of Object.values(groups)) {

        const phone =
            `+260${record.student.parentPhoneNumbers}`;

        await axios.post(
            'https://api.pushbullet.com/v2/texts',
            {
                data: {
                    addresses: [phone],
                    message: buildMessage(record),
                    target_device_iden: targetDeviceIden,
                    guid: uuidv4()
                }
            },
            {
                headers: {
                    'Access-Token': accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}


module.exports = {
    getResultFormData,
    getResults,
    sendStudentResults
};