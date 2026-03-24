const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { getStorage } = require('../config/firebase-admin');
const logger = require('../utils/logger');
const path = require('path');
const os = require('os');
const fs = require('fs');

const generateQRCode = async (verificationToken) => {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-noc/${verificationToken}`;
    return await QRCode.toDataURL(verifyUrl);
  } catch (error) {
    logger.error(`QR code generation error: ${error.message}`);
    return null;
  }
};

/**
 * Writes the NOC PDF to a temp file and returns a Promise that resolves with the local path.
 */
const writePDF = (certificate, application) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const tmpFile = path.join(os.tmpdir(), `noc-${certificate.certificateNumber}.pdf`);
    const writeStream = fs.createWriteStream(tmpFile);

    doc.pipe(writeStream);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#c0392b')
      .text('FIRE RISK INCIDENT MANAGEMENT SYSTEM', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text('NO OBJECTION CERTIFICATE (NOC)', { align: 'center' });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#c0392b');

    doc.moveDown();
    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#2c3e50')
      .text(`Certificate Number: ${certificate.certificateNumber}`, { align: 'right' });

    doc.text(`Date of Issue: ${new Date(certificate.issuedAt).toLocaleDateString('en-IN')}`, {
      align: 'right',
    });

    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica').text('This is to certify that the property:');

    doc.moveDown();
    doc.fontSize(13).font('Helvetica-Bold').text(certificate.propertyDetails.name);
    doc.fontSize(11).font('Helvetica').text(certificate.propertyDetails.address);
    doc.text(`Property Type: ${certificate.propertyDetails.type || 'N/A'}`);

    doc.moveDown();
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(
        'has been inspected and found to comply with the Fire Safety Standards. ' +
          'This NOC is hereby granted for the premises mentioned above.'
      );

    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Valid From: ${new Date(certificate.validFrom).toLocaleDateString('en-IN')}`);
    doc.text(`Valid Until: ${new Date(certificate.validUntil).toLocaleDateString('en-IN')}`);

    if (certificate.conditions && certificate.conditions.length > 0) {
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text('Conditions:');
      certificate.conditions.forEach((cond, i) => {
        doc.font('Helvetica').text(`${i + 1}. ${cond}`);
      });
    }

    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor('#7f8c8d')
      .text('Scan the QR code to verify this certificate online.', { align: 'center' });

    if (certificate.qrCode) {
      const qrBuffer = Buffer.from(certificate.qrCode.split(',')[1], 'base64');
      doc.image(qrBuffer, doc.page.width / 2 - 50, doc.y, { width: 100, align: 'center' });
    }

    doc.end();

    writeStream.on('finish', () => resolve(tmpFile));
    writeStream.on('error', reject);
  });

const generatePDF = async (certificate, application) => {
  const tmpFile = await writePDF(certificate, application);

  try {
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      const storage = getStorage();
      const destination = `noc-certificates/${certificate.certificateNumber}.pdf`;
      await storage.upload(tmpFile, { destination, public: true });
      const [url] = await storage.file(destination).getSignedUrl({
        action: 'read',
        expires: '01-01-2100',
      });
      fs.unlinkSync(tmpFile);
      return url;
    }
  } catch (uploadError) {
    logger.error(`PDF upload error: ${uploadError.message}`);
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }

  return `/certificates/${certificate.certificateNumber}.pdf`;
};

module.exports = { generatePDF, generateQRCode };
