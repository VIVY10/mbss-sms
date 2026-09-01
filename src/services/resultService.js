const resultModel = require('../models/resultModel.js');
const {
  getConnection,
  beginTransaction,
  commit,
  rollback,
} = require("../utils/db.js");


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


async function processStudentMarks(examid, subjectCode, marks, entered_by) {
  const connection = await getConnection();  
  try {
    // Validate input
    if (!examid || !subjectCode || !marks || !marks.length) {
      throw new Error("Missing required parameters");
    }
    
    const validMarks = marks.filter(m => m.studentclassid && m.mark !== undefined);
    if (validMarks.length === 0) {
      throw new Error("No valid marks data provided");
    }
    
    await beginTransaction(connection);
    
    // Get existing records
    const studentIds = validMarks.map(m => m.studentclassid);
    const existingRecordsResult = await resultModel.getExistingMarks(
      connection, 
      examid, 
      subjectCode, 
      studentIds
    );
    
    // Handle different return formats from connectionQuery
    let existingRecords = [];
    if (Array.isArray(existingRecordsResult)) {
      // If it returns [rows, fields]
      existingRecords = existingRecordsResult[0] || [];
    } else if (existingRecordsResult && existingRecordsResult.rows) {
      // If it returns { rows, fields }
      existingRecords = existingRecordsResult.rows || [];
    } else if (Array.isArray(existingRecordsResult)) {
      // If it returns just the rows array
      existingRecords = existingRecordsResult;
    } else {
      // Fallback
      existingRecords = [];
    }
    
    // Ensure we have an array
    if (!Array.isArray(existingRecords)) {
      existingRecords = [];
    }
    
    const existingIds = new Set(existingRecords.map(r => r.studentclassid));
    
    const toInsert = validMarks.filter(m => !existingIds.has(m.studentclassid));
    const toUpdate = validMarks.filter(m => existingIds.has(m.studentclassid));
    
    const results = [];
    
    // Insert new records
    if (toInsert.length > 0) {
      const insertValues = toInsert.flatMap(m => [
        m.studentclassid, subjectCode, examid, m.mark, entered_by
      ]);
      
      await resultModel.insertMarks(connection, toInsert.length, insertValues);
      
      toInsert.forEach(m => {
        results.push({
          status: "inserted",
          studentclassid: m.studentclassid,
          message: "Record inserted successfully"
        });
      });
    }
    
    // Update existing records
    for (const m of toUpdate) {
      await resultModel.updateExistingMarks(
        connection, m.mark, entered_by, examid, subjectCode, m.studentclassid
      );
      
      results.push({
        status: "updated",
        studentclassid: m.studentclassid,
        message: "Record updated successfully"
      });
    }
    
    await commit(connection);
    
    return {
      message: "Marks processed successfully",
      totalProcessed: results.length,
      inserted: toInsert.length,
      updated: toUpdate.length,
      results
    };
    
  } catch (error) {
    await rollback(connection);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};


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