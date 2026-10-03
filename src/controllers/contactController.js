const { matchedData } = require("express-validator");

const service = require("../services/contactService.js");

exports.showContactPage = async (req, res) => {
  res.render("./main/contact");
};

exports.sendContactMessage = async (req, res) => {
  try {
    // Check honeypot directly from raw request
    if (req.body.companyWebsite && req.body.companyWebsite.trim() !== "") {
      return res.status(400).json({
        sent: false,
        success: false,
        message: "Your enquiry could not be submitted.",
      });
    }

    const data = matchedData(req);

    const result = await service.sendContactMessage(data);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send your enquiry. Please try again.",
    });
  }
};
