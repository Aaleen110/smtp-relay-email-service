const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const API_TOKEN = process.env.API_TOKEN;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// SendGrid SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey', // this is the literal string 'apikey'
    pass: SENDGRID_API_KEY
  }
});

app.post('/send-email', async (req, res) => {
  console.log('Received email request:', {
    from: req.body.from,
    to: req.body.to,
    subject: req.body.subject,
    htmlLength: req.body?.html?.length || 0
  });

  const { from, to, subject, html } = req.body;

  if (!from || !to || !subject || !html) {
    console.log('Validation failed:', {
      missingFields: {
        from: !from,
        to: !to,
        subject: !subject,
        html: !html
      }
    });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('Attempting to send email via SendGrid SMTP...');

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Error sending email:', {
      error: err.message,
      code: err.code,
      responseCode: err.responseCode,
      response: err.response
    });
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
