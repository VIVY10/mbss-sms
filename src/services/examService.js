const model = require('../models/examModel.js');


async function createExam(examTitle) {
    const existing = await model.findByTitle(examTitle);

    if (existing.length) {
        return {
            created: false,
            reason: 'exists'
        };
    }

    await model.create(examTitle);

    return {
        created: true
    };
}


const getExams = model.findAll;
const deleteExam = model.remove;


module.exports = {
    createExam,
    getExams,
    deleteExam
};