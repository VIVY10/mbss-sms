const resultModel = require('../models/resultModel.js');


const getFilters = () =>
    resultModel.getResultFilters();


const getStudentResults = (
    examid,
    pupilId,
    termid,
    yearid
) =>
    resultModel.getStudentResults(
        examid,
        pupilId,
        termid,
        yearid
    );


const getProfile = examno =>
    resultModel.getProfile(examno);


async function deleteResult(data) {
    const result =
        await resultModel.deleteResult(data);

    if (!result.affectedRows) {
        throw Object.assign(
            new Error('Record not found'),
            { status: 404 }
        );
    }
}


async function updateResult(data) {
    const result =
        await resultModel.updateResult(data);

    if (!result.affectedRows) {
        throw Object.assign(
            new Error('Record not found'),
            { status: 404 }
        );
    }
}

 
// async function getMarksEntryData(teacherid) {
//   const foundClass = await resultModel.getTeacherClasses(teacherid);
//     console.log(foundClass)
//   if (!foundClass.length) {
//     return {
//       foundClass: [],
//       examType: []
//     };
//   }

//   const examType = await resultModel.getExams();

//   return {
//     foundClass,
//     examType
//   };
// }

// async function getMissingMarksStudents(classid, subjectcode, examtype) {
//   return resultModel.getMissingMarksStudents(
//     classid,
//     subjectcode,
//     examtype
//   );
// }


async function getMarksEntryData(teacherid) {
  const foundClass = await resultModel.getTeacherClasses(teacherid);

  if (!foundClass.length) {
    return {
      foundClass: [],
      examType: []
    };
  }

  const examType = await resultModel.getExams();

  return {
    foundClass,
    examType
  };
}

async function getMissingMarks(teacherid, classid, subjectcode, examid) {
  return resultModel.getMissingMarks(
    teacherid,
    classid,
    subjectcode,
    examid
  );
}


async function processStudentMarks(termid, yearid, examid, subjectcode, examData) {
    try {
      // Check for existing records and insert new ones
      const results = await resultModel.insertStudentMarks(
        termid,
        yearid,
        examid,
        subjectcode,
        examData
      );

      return results;
      
    } catch (error) {
      throw error;
    }
  }


async function getClassInfoPage(teacherid) {

    const foundClass =  await resultModel.getTeacherClass(teacherid)
    const examType = await resultModel.getExams()
    const term = await resultModel.getTerms()

    return {
        foundClass,
        examType,
        term
    };
}


async function getClassResults({
    teacherid,
    examid,
    classid,
    subjectcode,
    termid,
    schoolyearid
}) {

    // Make sure the teacher is actually
    // allocated to this class and subject.

    const teacherClasses = await resultModel.getTeacherClasses(teacherid);

    // console.log(teacherClasses)

    const allocationExists = teacherClasses.some(item =>
        String(item.classid) === String(classid) &&
        String(item.subjectcode) === String(subjectcode)
    );

    if (!allocationExists) {
        throw Object.assign(
            new Error(
                'You are not allocated to this class and subject.'
            ),
            { status: 403 }
        );
    }


    return resultModel.getClassResults({
        examid,
        classid,
        subjectcode,
        teacherid,
        termid,
        schoolyearid
    });
}


module.exports = {
    getFilters,
    getStudentResults,
    getProfile,
    deleteResult,
    updateResult,
    getMarksEntryData,
    getMissingMarks,
    processStudentMarks,
    getClassInfoPage,
    getClassResults
};