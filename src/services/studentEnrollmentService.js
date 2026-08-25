// services/studentEnrollmentService.js

const { getConnection } = require('../utils/db');
const pupilModel = require('../models/pupilModel');

async function enrollReturningStudent({ data }) {
    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        /*
         * 1. Find existing student
         */
        const students =
            await pupilModel.findStudentOnConnection(
                connection,
                data.examno
            );

        if (!students.length) {
            throw new Error(
                'Student was not found. Register the student as a new student first.'
            );
        }

        const student = students[0];

        /*
         * 2. Make sure the student is allowed to return
         */
        if (student.status === 'suspended') {
            throw new Error(
                'This student is suspended and cannot be enrolled as a returning student.'
            );
        }

        if (
            student.status === 'transferred' ||
            student.status === 'left'
        ) {
            throw new Error(
                `Student status is ${student.status}. The student cannot be enrolled as returning.`
            );
        }

        /*
         * 3. Make sure the student has not already
         *    been enrolled in this year/term.
         */
        const existingEnrollment =
            await pupilModel.findCurrentEnrollment(
                connection,
                data.examno,
                data.yearid,
                data.termid
            );

        if (existingEnrollment.length) {
            throw new Error(
                'This student is already enrolled for the selected term.'
            );
        }

        /*
         * 4. Validate class
         */
        const classRows =
            await pupilModel.findClassForEnrollment(
                connection,
                data.classid,
                data.yearlevel
            );

        if (!classRows.length) {
            throw new Error(
                'The selected class does not belong to the selected year level.'
            );
        }

        /*
         * 5. Create studentclass
         *
         * IMPORTANT:
         * addClass() must return studentclassid.
         */
        const enrollment =
            await pupilModel.addClass(
                connection,
                data.examno,
                data.classid,
                data.termid,
                data.yearid,
                'RETURNING'
            );

        /*
         * 6. Create reporting record
         *
         * The database sets reporting_date
         * using CURRENT_TIMESTAMP.
         */
        await pupilModel.addReporting(
            connection,
            enrollment.studentclassid
        );

        /*
         * 7. Commit everything
         */
        await connection.commit();

        return {
            message: 'Returning student successfully enrolled and marked as reported.',
            examno: data.examno,
            studentclassid: enrollment.studentclassid
        };

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();
    }
}

module.exports = {
    enrollReturningStudent
};