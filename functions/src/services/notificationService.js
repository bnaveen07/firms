const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `FRIMS <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
  }
};

const sendApplicationStatusUpdate = async (application) => {
  if (!application.applicant || !application.applicant.email) return;

  const subject = `NOC Application ${application.applicationNumber} - Status Update`;
  const html = `
    <h2>Application Status Update</h2>
    <p>Dear Applicant,</p>
    <p>Your NOC application <strong>${application.applicationNumber}</strong> for 
    <strong>${application.propertyName}</strong> has been updated.</p>
    <p>Current Status: <strong>${application.status.replace(/_/g, ' ').toUpperCase()}</strong></p>
    ${application.reviewNotes ? `<p>Review Notes: ${application.reviewNotes}</p>` : ''}
    ${application.rejectionReason ? `<p>Rejection Reason: ${application.rejectionReason}</p>` : ''}
    <p>Please log in to the FRIMS portal for more details.</p>
    <br>
    <p>FRIMS Team</p>
  `;

  await sendEmail({
    to: application.applicant.email,
    subject,
    html,
    text: `Your application ${application.applicationNumber} status: ${application.status}`,
  });
};

const sendInspectionScheduled = async (application, inspection) => {
  if (!application.applicant || !application.applicant.email) return;

  const subject = `Inspection Scheduled for ${application.applicationNumber}`;
  const html = `
    <h2>Inspection Scheduled</h2>
    <p>An inspection has been scheduled for your property.</p>
    <p>Application: <strong>${application.applicationNumber}</strong></p>
    <p>Date: <strong>${new Date(inspection.scheduledDate).toLocaleDateString()}</strong></p>
    <p>Please ensure access is available to the property on the scheduled date.</p>
  `;

  await sendEmail({ to: application.applicant.email, subject, html, text: subject });
};

module.exports = { sendEmail, sendApplicationStatusUpdate, sendInspectionScheduled };
