const { body } = require("express-validator");

/*
|--------------------------------------------------------------------------
| Reusable Validators
|--------------------------------------------------------------------------
*/

const requiredText = (field, message = `${field} is required.`) =>
  body(field).trim().notEmpty().withMessage(message);

const requiredInt = (field, message = `${field} must be a valid number.`) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required.`)
    .isInt()
    .withMessage(message);

const nameValidator = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      `${label} can only contain letters, spaces, hyphens and apostrophes.`,
    )
    .escape();

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
    .notEmpty()
    .withMessage("Password is required.")
    .custom(isValidPassword)
    .withMessage(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    );

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
    .isLength({ min: 4, max: 50 })
    .withMessage("School year name must be between 4 and 50 characters.")
    .matches(/^\d{4}\s+school\s+year$/i)
    .withMessage('School year name must be in the format "2026 school year".'),

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
  body("yearname")
    .trim()
    .notEmpty()
    .withMessage("School year name is required.")
    .isLength({ min: 4, max: 50 })
    .withMessage("School year name must be between 4 and 50 characters.")
    .matches(/^\d{4}\s+school\s+year$/i)
    .withMessage('School year name must be in the format "2026 school year".'),

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

const pupilValidationRules = () => [
  // Exam Number
  body("examno")
    .trim()
    .notEmpty()
    .withMessage("Exam number is required.")
    .isLength({ min: 12, max: 20 })
    .withMessage("Exam number must be between 12 and 20 characters.")
    .matches(/^\d+$/)
    .withMessage("Exam number must contain digits only.")
    .escape(),

  // Password
  passwordValidator("password"),

  // Pupil Names
  nameValidator("fname", "First name"),
  nameValidator("lname", "Last name"),

  // Gender
  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required.")
    .isIn(["male", "female"])
    .withMessage("Gender must be either male or female.")
    .escape(),

  // Date of Birth
  body("dob")
    .trim()
    .notEmpty()
    .withMessage("Date of birth is required.")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date of birth must be in YYYY-MM-DD format.")
    .isISO8601({ strict: true })
    .withMessage("Enter a valid date.")
    .escape(),

  // Year Level
  body("yearlevel")
    .optional({ values: "falsy" })
    .isInt()
    .withMessage("Invalid year level.")
    .toInt(),

  // Sponsor ID
  requiredInt("sponsor", "Invalid sponsor ID."),

  // OVC Status ID
  requiredInt("ovcstatus", "Invalid OVC status."),

  // NRC Number
  body("nrcno")
    .trim()
    .notEmpty()
    .withMessage("NRC number is required.")
    .matches(/^\d{9}$/)
    .withMessage("NRC number must contain exactly 9 digits.")
    .escape(),

  // Guardian Names
  nameValidator("guardianFname", "Guardian first name"),
  nameValidator("guardianLname", "Guardian last name"),

  // Phone Number
  phoneValidator(),

  // Relationship ID
  requiredInt("relationship", "Invalid relationship ID."),

  // studentstatus ID
  requiredInt("studentstatus", "Invalid student status ID."),

  // class ID
  requiredInt("classid", "Invalid class ID."),
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

  nameValidator("Fname", "First name"),
  nameValidator("Lname", "Last name"),

  passwordValidator("password"),

  requiredText("gender", "Gender is required."),
  requiredText("usertype", "User type is required."),
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
  checkexamnoValidationRules,
  pupilValidationRules,
  registerTeacherValidationRules,
  createExamValidationRules,
  emailValidationRules,
  resetPasswordValidationRules,
  contactusValidationRules,
  enterMarksValidationRules,
};
