const { query } = require("../utils/db.js");


// admin stats
exports.countStudents = () =>
  query(`SELECT COUNT(*) AS students FROM students`);

exports.countTeachers = () =>
  query(`SELECT COUNT(*) AS teachers FROM teachers t WHERE t.usertype = 'teacher'`);

exports.countDepartments = () =>
    query(`SELECT COUNT(*) AS departments FROM department`)


exports.countSubjects = () =>
    query(`SELECT COUNT(*) AS subjects FROM subjects`)


exports.countClasses = () =>
    query(`SELECT COUNT(*) AS classes FROM class`)


// HOD stats
exports.countDepartmentTeachers = (departmentid) =>
    query(`SELECT COUNT(*) AS teachers FROM teacher_department WHERE departmentid = ?`,
        [departmentid]
    )

exports.countDepartmentSubjects = (departmentid) =>
    query(`SELECT COUNT(*) AS subjects FROM subjects WHERE departmentid = ?`,
        [departmentid]
    )



exports.countDepartmentClasses = (departmentid) =>
    query(`
        SELECT COUNT(s.subjectcode) AS classSubjects 
            FROM class_subjects cs
            JOIN subjects s 
            ON cs.subjectcode = s.subjectcode
            WHERE s.departmentid = ?
        `, [departmentid]
    )



exports.countUnallocatedSubjects = (termid, departmentid) =>
    query(`
        SELECT COUNT(s.subjectcode) AS unallocatedSubjects
            FROM class_subjects cs
            INNER JOIN class c ON cs.classid = c.classid
            INNER JOIN yearlevel yl ON c.levelid = yl.levelorder
            INNER JOIN subjects s ON cs.subjectcode = s.subjectcode
            INNER JOIN department d ON d.departmentid = s.departmentid
            CROSS JOIN terms t
            WHERE t.termid = ?
            AND s.departmentid = ?
            AND t.status = 'OPEN'
            AND NOT EXISTS (
                SELECT 1 
                FROM teaching_allocations ta
                WHERE ta.class_subject_id = cs.class_subject_id
                    AND ta.termid = t.termid
            )
            ORDER BY yl.levelorder, c.class, s.subjectname
        `, 
        [termid, departmentid]
    )


// exports.departmentTeachersStats = (termid, departmentid) =>
//     query(`
//         SELECT
//             t.teacherid,
//             t.fname,
//             t.lname,
//             t.employee_no,
//             t.status,
//             t.email,
//             dp.departmentname,
//             (
//                 SELECT COUNT(DISTINCT ts.subjectcode) FROM teacher_subject ts
//                 WHERE ts.teacherid = t.teacherid
//              )  AS subject_count,
//             (
//                 SELECT COUNT(DISTINCT ta.class_subject_id)
//                 FROM teaching_allocations AS ta
//                 WHERE ta.teacherid = t.teacherid
//                   AND ta.termid = ?
// 			) AS class_subject_count
//         FROM teacher_department AS td

//         JOIN teachers AS t
//             ON td.teacherid = t.teacherid

//         JOIN department AS dp
//             ON dp.departmentid = td.departmentid
            
//         WHERE td.departmentid = ?

//         GROUP BY
//             t.teacherid,
//             t.fname,
//             t.lname,
//             t.employee_no,
//             t.status,
//             t.email,
//             dp.departmentname
//         `[termid, departmentid]
//     )

exports.getTermDepartmentTeachersStats = (departmentid, termid) =>
    query(
        `
        SELECT 
            t.teacherid, 
            t.fname, 
            t.lname, 
            t.employee_no, 
            t.status, 
            t.email, 
            dp.departmentname, 

            (
                SELECT COUNT(DISTINCT ts.subjectcode)
                FROM teacher_subject AS ts
                WHERE ts.teacherid = t.teacherid
            ) AS subject_count,

            (
                SELECT COUNT(DISTINCT cs.classid)
                FROM class_subjects AS cs
                JOIN teaching_allocations AS ta
                    ON ta.class_subject_id = cs.class_subject_id
                WHERE ta.teacherid = t.teacherid
                  AND ta.termid = ?
            ) AS class_count,

            (
                SELECT COUNT(DISTINCT ta.class_subject_id)
                FROM teaching_allocations AS ta
                WHERE ta.teacherid = t.teacherid
                  AND ta.termid = ?
            ) AS class_subject_count

        FROM teacher_department AS td

        JOIN teachers AS t
            ON td.teacherid = t.teacherid

        JOIN department AS dp
            ON dp.departmentid = td.departmentid

        WHERE td.departmentid = ?

        ORDER BY t.lname, t.fname
        `,
        [termid, termid, departmentid]
    );


exports.department_teaching_allocation = (termid, departmentid) =>
  query(`
    SELECT 
        cs.class_subject_id,
        c.classid,
        c.class,
        yl.levelname,
        s.subjectcode,
        s.subjectname,
        d.departmentname,

        t.termid,
        t.termname,

        CASE 
            WHEN ta.allocation_id IS NOT NULL 
                THEN 'Allocated'
            ELSE 'Not Allocated'
        END AS allocation_status,

        ta.teacherid,

        CONCAT(tchr.fname, ' ', tchr.lname) AS teacher_name,

        ta.end_date

    FROM class_subjects AS cs

    INNER JOIN class AS c
        ON cs.classid = c.classid

    INNER JOIN yearlevel AS yl
        ON c.levelid = yl.levelorder

    INNER JOIN subjects AS s
        ON cs.subjectcode = s.subjectcode

    INNER JOIN department AS d
        ON d.departmentid = s.departmentid

    INNER JOIN terms AS t
        ON t.termid = ?

    LEFT JOIN teaching_allocations AS ta
        ON cs.class_subject_id = ta.class_subject_id
        AND ta.termid = t.termid

    LEFT JOIN teachers AS tchr
        ON ta.teacherid = tchr.teacherid

    WHERE d.departmentid = ?

    ORDER BY
        allocation_status DESC,
        yl.levelorder,
        c.class,
        s.subjectname;
    `, 
    [termid, departmentid]
  )



exports.class_subjects = (termid, departmentid) =>
  query(`
    SELECT 
        cs.class_subject_id,
        c.classid,
        c.class,
        yl.levelname,
        s.subjectcode,
        s.subjectname,
        d.departmentname,

        t.termid,
        t.termname,

        CASE 
            WHEN ta.allocation_id IS NOT NULL 
                THEN 'Allocated'
            ELSE 'Not Allocated'
        END AS allocation_status,

        ta.teacherid,

        CONCAT(tchr.fname, ' ', tchr.lname) AS teacher_name,

        ta.end_date

    FROM class_subjects AS cs

    INNER JOIN class AS c
        ON cs.classid = c.classid

    INNER JOIN yearlevel AS yl
        ON c.levelid = yl.levelorder

    INNER JOIN subjects AS s
        ON cs.subjectcode = s.subjectcode

    INNER JOIN department AS d
        ON d.departmentid = s.departmentid

    INNER JOIN terms AS t
        ON t.termid = ?

    LEFT JOIN teaching_allocations AS ta
        ON cs.class_subject_id = ta.class_subject_id
        AND ta.termid = t.termid

    LEFT JOIN teachers AS tchr
        ON ta.teacherid = tchr.teacherid

    WHERE d.departmentid = ?

    ORDER BY
        allocation_status DESC,
        yl.levelorder,
        c.class,
        s.subjectname;
    `, 
    [termid, departmentid]
  )