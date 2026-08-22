const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const stream = require('stream');

const generateCSV = async (data) => {
    const parser = new Parser();
    return parser.parse(data);
};

const generatePDF = async (data, title = 'Report') => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.fontSize(18).text(title, { align: 'center' }).moveDown();
    doc.fontSize(12);

    data.forEach((item, idx) => {
        doc.text(`${idx + 1}. ${JSON.stringify(item)}`).moveDown(0.5);
    });

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });
        doc.on('error', reject);
    });
};

module.exports = {
    generateCSV,
    generatePDF
};
