const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const API_TOKEN = process.env.API_TOKEN;

// Middleware to verify API token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  if (token !== API_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  next();
};


const transporter = nodemailer.createTransport({
  host: 'smtp-relay.gmail.com',
  port: 587,
  secure: false, // TLS requires secure:false and port 587
  tls: {
    rejectUnauthorized: false // Verify TLS/SSL certificate
  }
});

app.post('/send-email', authenticateToken, async (req, res) => {
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
    console.log('Attempting to send email with configuration:', {
      host: transporter.options.host,
      port: transporter.options.port,
      secure: transporter.options.secure
    });

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
      command: err.command,
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
