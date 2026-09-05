const { body } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Reusable Validators
|--------------------------------------------------------------------------
*/
const optionalText = (field, maxLength, message) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: maxLength })
    .withMessage(message || `${field} must not exceed ${maxLength} characters.`)
    .escape();

const nameValidator = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ min: 2, max: 100 })
    .withMessage(`${label} must be between 2 and 100 characters.`)
    .matches(/^[A-Za-zÀ-ÿ' -]+$/)
    .withMessage(`${label} contains invalid characters.`)
    .escape();

// const nameValidator = (field, label) =>
//   body(field)
//     .trim()
//     .notEmpty()
//     .withMessage(`${label} is required.`)
//     .matches(/^[a-zA-Z\s'-]+$/)
//     .withMessage(
//       `${label} can only contain letters, spaces, hyphens and apostrophes.`,
//     )
//     .escape();

const optionalNameValidator = (field, label) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(`${label} must not exceed 100 characters.`)
    .matches(/^[A-Za-zÀ-ÿ' -]+$/)
    .withMessage(`${label} contains invalid characters.`)
    .escape();

/*
|--------------------------------------------------------------------------
| Date Validator
|--------------------------------------------------------------------------
*/

const strictDateValidator = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(`${label} must be in YYYY-MM-DD format.`)
    .isISO8601({ strict: true })
    .withMessage(`Enter a valid ${label.toLowerCase()}.`);

const requiredText = (field, message = `${field} is required.`) =>
  body(field).trim().notEmpty().withMessage(message);

const requiredInt = (field, message = `${field} must be a valid number.`) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required.`)
    .isInt()
    .withMessage(message);

const otherNameValidator = (field, label) =>
  body(field).optional().trim().escape();

const dateValidator = (field = "date") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("date is required.")
    .isISO8601({ strict: true })
    .withMessage("date must be a valid date in YYYY-MM-DD format.");

const phoneValidator = (field = "phoneNumber") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must contain exactly 10 digits.");

const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const passwordValidator = (field = "password") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required.`)
    .isLength({ min: 8, max: 72 })
    .withMessage(`${field} must be between 8 and 72 characters.`)
    .matches(/[A-Z]/)
    .withMessage(`${field} must contain at least one uppercase letter.`)
    .matches(/[a-z]/)
    .withMessage(`${field} must contain at least one lowercase letter.`)
    .matches(/\d/)
    .withMessage(`${field} must contain at least one number.`)
    .matches(/[^A-Za-z0-9]/)
    .withMessage(`${field} must contain at least one special character.`);

/*
|--------------------------------------------------------------------------
| school year
|--------------------------------------------------------------------------
*/
const schoolyearValidationRules = () => [
  body("yearname")
    .trim()
    .notEmpty()
    .withMessage("School year name is required.")
    .isLength({ max: 4, max: 4 })
    .withMessage("School year name must be 4 characters.")
    .matches(/^\d{4}/i)
    .withMessage('School year name must be in the format "YYYY".'),

  body("startdate")
    .trim()
    .notEmpty()
    .withMessage("Start date is required.")
    .isISO8601({ strict: true })
    .withMessage("Start date must be a valid date in YYYY-MM-DD format."),

  body("enddate")
    .trim()
    .notEmpty()
    .withMessage("End date is required.")
    .isISO8601({ strict: true })
    .withMessage("End date must be a valid date in YYYY-MM-DD format.")
    .custom((enddate, { req }) => {
      if (!req.body.startdate) {
        return true;
      }

      const start = new Date(`${req.body.startdate}T00:00:00`);
      const end = new Date(`${enddate}T00:00:00`);

      if (end <= start) {
        throw new Error("End date must be after the start date.");
      }

      return true;
    }),
];

const addTermValiadtionRules = () => [
  requiredInt("yearid"),

  requiredText("termname"),

  body("termnumber").trim().notEmpty().withMessage("term number is required."),

  body("startdate")
    .trim()
    .notEmpty()
    .withMessage("Start date is required.")
    .isISO8601({ strict: true })
    .withMessage("Start date must be a valid date in YYYY-MM-DD format."),

  body("enddate")
    .trim()
    .notEmpty()
    .withMessage("End date is required.")
    .isISO8601({ strict: true })
    .withMessage("End date must be a valid date in YYYY-MM-DD format.")
    .custom((enddate, { req }) => {
      if (!req.body.startdate) {
        return true;
      }

      const start = new Date(`${req.body.startdate}T00:00:00`);
      const end = new Date(`${enddate}T00:00:00`);

      if (end <= start) {
        throw new Error("End date must be after the start date.");
      }

      return true;
    }),
];

const createDepartmentValidationRules = () => [requiredText("departmentname")];

const addGuardianTypeValidationRules = () => [requiredText("guardianType")];

const createSubjectValidationRules = () => {
  return [
    body("subjectcode").notEmpty().isNumeric().trim().escape(),
    body("department").notEmpty().isNumeric().trim().escape(),
    body("subjectname").notEmpty().trim().escape(),
  ];
};

const addClassSubjectsValidationrules = () => {
  return [
    body("subjectcode").notEmpty().isNumeric().trim().escape(),
    body("classid").notEmpty().isNumeric().trim().escape(),
  ];
};

/*
|--------------------------------------------------------------------------
| Student
|--------------------------------------------------------------------------
*/

const checkexamnoValidationRules = () => [
  body("examno")
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage("Must be at least 4 chars long")
    .trim()
    .escape(),
];


/*
|--------------------------------------------------------------------------
| NEW PUPIL VALIDATION RULES
|--------------------------------------------------------------------------
*/

const pupilValidationRules = () => [
  // =========================================================
  // ENROLLMENT TYPE
  // =========================================================

  body("enrollment_type")
    .trim()
    .notEmpty()
    .withMessage("Enrollment type is required.")
    .isIn(["new"])
    .withMessage("Invalid enrollment type.")
    .escape(),

  // =========================================================
  // STUDENT IDENTITY
  // =========================================================

  body("examno")
    .trim()
    .notEmpty()
    .withMessage("Exam number is required.")
    .isLength({ min: 12, max: 20 })
    .withMessage("Exam number must be between 12 and 20 digits.")
    .matches(/^\d+$/)
    .withMessage("Exam number must contain digits only."),

  // =========================================================
  // PASSWORD
  // =========================================================

  passwordValidator("password"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your password.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }

      return true;
    }),

  // =========================================================
  // STUDENT NAMES
  // =========================================================

  nameValidator("fname", "First name"),

  nameValidator("lname", "Last name"),

  optionalNameValidator("middlename", "Middle name"),

  // =========================================================
  // GENDER
  // =========================================================

  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required.")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female or other.")
    .escape(),

  // =========================================================
  // EMAIL
  // =========================================================

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  // =========================================================
  // STUDENT PHONE
  // =========================================================

  body("studentPhoneNumber")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Student phone number must contain exactly 10 digits."),

  // =========================================================
  // DATE OF BIRTH
  // =========================================================

  strictDateValidator("dob", "Date of birth"),

  body("dob").custom((dob, { req }) => {
    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Cannot be today or in the future
    if (birthDate >= today) {
      throw new Error("Date of birth must be before today.");
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Minimum school registration age
    if (age < 4) {
      throw new Error("Student does not meet the minimum age requirement.");
    }

    // Optional upper-bound sanity check
    if (age > 30) {
      throw new Error("Please verify the student's date of birth.");
    }

    // DOB cannot be after admission date
    if (req.body.admission_date) {
      const admissionDate = new Date(`${req.body.admission_date}T00:00:00`);

      if (birthDate > admissionDate) {
        throw new Error("Date of birth cannot be after admission date.");
      }
    }

    return true;
  }),

  // =========================================================
  // PLACE OF BIRTH
  // =========================================================

  body("birthplace")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Place of birth must not exceed 100 characters.")
    .matches(/^[A-Za-zÀ-ÿ0-9\s.,'()/\-]+$/)
    .withMessage("Place of birth contains invalid characters.")
    .escape(),

  // =========================================================
  // NATIONALITY
  // =========================================================

  body("nationality")
    .trim()
    .notEmpty()
    .withMessage("Nationality is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nationality must be between 2 and 100 characters.")
    .matches(/^[A-Za-zÀ-ÿ\s'-]+$/)
    .withMessage("Nationality contains invalid characters.")
    .escape(),

  // =========================================================
  // RELIGION
  // =========================================================

  optionalText("religion", 100, "Religion must not exceed 100 characters."),

  // =========================================================
  // STUDENT NRC / BIRTH CERTIFICATE
  // =========================================================

  body("studentnrcno")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage(
      "NRC / Birth Certificate number must not exceed 50 characters.",
    )
    .matches(/^[A-Za-z0-9/-]+$/)
    .withMessage("NRC / Birth Certificate number contains invalid characters.")
    .escape(),

  // =========================================================
  // PREVIOUS SCHOOL
  // =========================================================

  optionalText(
    "previous_school",
    150,
    "Previous school must not exceed 150 characters.",
  ),

  // =========================================================
  // ADMISSION DATE
  // =========================================================

  strictDateValidator("admission_date", "Admission date"),

  body("admission_date").custom((date) => {
    const admissionDate = new Date(`${date}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (admissionDate > today) {
      throw new Error("Admission date cannot be in the future.");
    }

    return true;
  }),

  // =========================================================
  // ADDRESS
  // =========================================================

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Residential address is required.")
    .isLength({ min: 2, max: 255 })
    .withMessage("Address must be between 2 and 255 characters.")
    .escape(),

  // =========================================================
  // SCHOOL ENROLLMENT
  // =========================================================

  requiredInt("termid", "Invalid term ID."),

  requiredInt("schoolyear", "Invalid school year ID."),

  requiredInt("yearlevel", "Invalid year level ID."),

  requiredInt("classid", "Invalid class ID."),

  // =========================================================
  // STUDENT CLASSIFICATION
  // =========================================================

  requiredInt("sponsor", "Invalid sponsor ID."),

  requiredInt("ovcstatus", "Invalid OVC status ID."),

  requiredInt("studentstatus", "Invalid student status ID."),

  // =========================================================
  // GUARDIAN IDENTITY
  // =========================================================

  body("guardian_nrc_no")
    .trim()
    .notEmpty()
    .withMessage("Guardian NRC number is required.")
    .isLength({ max: 15 })
    .withMessage("Guardian NRC number must not exceed 15 characters.")
    .matches(/^[A-Za-z0-9/-]+$/)
    .withMessage("Guardian NRC number contains invalid characters.")
    .escape(),

  nameValidator("guardianFname", "Guardian first name"),

  nameValidator("guardianLname", "Guardian last name"),

  // =========================================================
  // GUARDIAN OCCUPATION
  // =========================================================

  body("guardian_occupation")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Guardian occupation must not exceed 255 characters.")
    .escape(),

  // =========================================================
  // GUARDIAN ADDRESS
  // =========================================================

  body("guardian_address")
    .trim()
    .notEmpty()
    .withMessage("Guardian address is required.")
    .isLength({ min: 2, max: 255 })
    .withMessage("Guardian address must be between 2 and 255 characters.")
    .escape(),

  // =========================================================
  // GUARDIAN PRIMARY PHONE
  // =========================================================

  phoneValidator("phoneNumber", "Guardian phone number"),

  // =========================================================
  // GUARDIAN ALTERNATIVE PHONE
  // =========================================================

  body("guardian_alt_phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{10}$/)
    .withMessage(
      "Alternative guardian phone number must contain exactly 10 digits.",
    )
    .custom((value, { req }) => {
      if (value && value === req.body.phoneNumber) {
        throw new Error(
          "Alternative phone number must be different from the primary phone number.",
        );
      }

      return true;
    }),

  // =========================================================
  // GUARDIAN RELATIONSHIP
  // =========================================================

  requiredInt("relationship", "Invalid guardian relationship ID."),

  // =========================================================
  // GUARDIAN EMAIL
  // =========================================================

  body("guardian_email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Enter a valid guardian email address.")
    .normalizeEmail(),
];


/*
|--------------------------------------------------------------------------
| RETURNING PUPIL VALIDATION RULES
|--------------------------------------------------------------------------
*/

const returningPupilValidationRules = () => [

  // =========================================================
  // PUPIL / ENROLLMENT
  // =========================================================

  body("examno")
    .trim()
    .notEmpty()
    .withMessage("Exam number is required.")
    .isLength({ min: 1, max: 50 })
    .withMessage("Exam number must not exceed 50 characters.")
    .matches(/^[A-Za-z0-9/-]+$/)
    .withMessage("Exam number contains invalid characters."),

  body("classid")
    .trim()
    .notEmpty()
    .withMessage("Class is required.")
    .isInt({ min: 1 })
    .withMessage("Class must be valid."),

  // School year is a DATABASE ID
  body("schoolyear")
    .trim()
    .notEmpty()
    .withMessage("School year is required.")
    .isInt({ min: 1 })
    .withMessage("School year ID must be valid."),

  body("termid")
    .trim()
    .notEmpty()
    .withMessage("Term is required.")
    .isInt({ min: 1 })
    .withMessage("Term must be valid."),

  // Student status is a DATABASE ID
  body("studentstatus")
    .trim()
    .notEmpty()
    .withMessage("Student status is required.")
    .isInt({ min: 1 })
    .withMessage("Student status ID must be valid."),

  // Sponsor is a DATABASE ID
  body("sponsor")
    .trim()
    .notEmpty()
    .withMessage("Sponsor is required.")
    .isInt({ min: 1 })
    .withMessage("Sponsor ID must be valid."),

  // OVC status is a DATABASE ID
  body("ovcstatus")
    .trim()
    .notEmpty()
    .withMessage("OVC status is required.")
    .isInt({ min: 1 })
    .withMessage("OVC status ID must be valid."),

  body("enrollment_type")
    .trim()
    .equals("returning")
    .withMessage("Invalid enrollment type."),

  // =========================================================
  // GUARDIAN
  // =========================================================

  body("guardianFname")
    .trim()
    .notEmpty()
    .withMessage("Guardian first name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Guardian first name must be between 2 and 100 characters."
    )
    .matches(/^[A-Za-zÀ-ÿ' -]+$/)
    .withMessage("Guardian first name contains invalid characters."),

  body("guardianLname")
    .trim()
    .notEmpty()
    .withMessage("Guardian last name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Guardian last name must be between 2 and 100 characters."
    )
    .matches(/^[A-Za-zÀ-ÿ' -]+$/)
    .withMessage("Guardian last name contains invalid characters."),

  // Relationship is a DATABASE ID
  body("relationship")
    .trim()
    .notEmpty()
    .withMessage("Guardian relationship is required.")
    .isInt({ min: 1 })
    .withMessage("Invalid guardian relationship ID."),

  // Keep consistent with your NEW pupil validator
  body("guardian_nrc_no")
    .trim()
    .notEmpty()
    .withMessage("Guardian NRC number is required.")
    .isLength({ max: 15 })
    .withMessage("Guardian NRC number must not exceed 15 characters.")
    .matches(/^[A-Za-z0-9/-]+$/)
    .withMessage("Guardian NRC number contains invalid characters."),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Guardian phone number is required.")
    .matches(/^\d{10}$/)
    .withMessage(
      "Guardian phone number must contain exactly 10 digits."
    ),

  body("guardian_email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Enter a valid guardian email address.")
    .normalizeEmail(),

  body("guardian_occupation")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage(
      "Guardian occupation must not exceed 100 characters."
    ),

  body("guardian_address")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage(
      "Guardian address must be between 3 and 255 characters."
    ),
];

/*
|--------------------------------------------------------------------------
| Teacher
|--------------------------------------------------------------------------
*/

const registerTeacherValidationRules = () => [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 5, max: 30 })
    .withMessage("Username must be between 5 and 30 characters.")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage("Username contains invalid characters.")
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  phoneValidator(),

  nameValidator("Fname", "First name"),
  nameValidator("Lname", "Last name"),
  otherNameValidator("otherNames", "Other Names"),

  passwordValidator("password"),

  requiredText("gender", "Gender is required."),
  requiredText("usertype", "User type is required."),
  requiredInt("employee_no"),

  dateValidator("employmentDate"),
];

/*
|--------------------------------------------------------------------------
| Exams
|--------------------------------------------------------------------------
*/

const createExamValidationRules = () => [
  body("examTitle")
    .trim()
    .notEmpty()
    .withMessage("Exam title is required.")
    .isLength({ min: 2, max: 150 })
    .withMessage("Exam title must be between 2 and 150 characters.")
    .escape(),
];

/*
|--------------------------------------------------------------------------
| Email
|--------------------------------------------------------------------------
*/

const emailValidationRules = () => [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
];

/*
|--------------------------------------------------------------------------
| Password Reset
|--------------------------------------------------------------------------
*/

const resetPasswordValidationRules = () => [
  passwordValidator("password1"),

  body("password2")
    .notEmpty()
    .withMessage("Please confirm your password.")
    .custom((value, { req }) => {
      return value === req.body.password1;
    })
    .withMessage("Passwords do not match."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("token")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required.")
    .matches(/^[a-f0-9]{128}$/i)
    .withMessage("Invalid reset token."),
];

/*
|--------------------------------------------------------------------------
| Contact Us
|--------------------------------------------------------------------------
*/

const contactusValidationRules = () => [
  body("senderName")
    .trim()
    .notEmpty()
    .withMessage("Sender name is required.")
    .isLength({ max: 100 })
    .withMessage("Sender name is too long.")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Sender name contains invalid characters.")
    .escape(),

  body("emailAddress")
    .trim()
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),

  body("emailMessage")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ max: 5000 })
    .withMessage("Message is too long.")
    .escape(),

  body("jobtitle")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Job title is too long.")
    .escape(),
];

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

const enterMarksValidationRules = () => [
  // Validate examid
  body("examid")
    .notEmpty()
    .withMessage("Exam ID is required")
    .isInt({ min: 1 })
    .withMessage("Exam ID must be a positive integer")
    .trim()
    .escape(),

  // Validate subjectcode
  body("subjectcode")
    .notEmpty()
    .withMessage("Subject code is required")
    .isLength({ min: 2, max: 10 })
    .withMessage("Subject code must be between 2 and 10 characters")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("Subject code must contain only alphanumeric characters")
    .trim()
    .escape(),

  // term ID
  requiredInt("yearid", "Invalid year ID."),

  // year ID
  requiredInt("termid", "Invalid term ID."),

  // Validate examData array
  body("examData")
    .isArray({ min: 1 })
    .withMessage("Exam data must be a non-empty array"),

  // Validate each item in examData
  body("examData.*.examno")
    .notEmpty()
    .withMessage("Exam number is required for each entry")
    .isLength({ min: 4 })
    .withMessage("Exam number must be at least 4 characters long")
    .trim()
    .escape(),

  body("examData.*.score")
    .notEmpty()
    .withMessage("Score is required for each entry")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100")
    .trim()
    .escape(),
];

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  schoolyearValidationRules,
  addTermValiadtionRules,
  createDepartmentValidationRules,
  addGuardianTypeValidationRules,
  createSubjectValidationRules,
  addClassSubjectsValidationrules,
  checkexamnoValidationRules,
  pupilValidationRules,
  returningPupilValidationRules,
  registerTeacherValidationRules,
  createExamValidationRules,
  emailValidationRules,
  resetPasswordValidationRules,
  contactusValidationRules,
  enterMarksValidationRules,
};
