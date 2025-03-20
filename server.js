const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


const transporter = nodemailer.createTransport({
  host: 'smtp-relay.gmail.com',
  port: 587,
  secure: false, // TLS requires secure:false and port 587
  tls: {
    rejectUnauthorized: false // Verify TLS/SSL certificate
  }
});

app.post('/send-email', async (req, res) => {
  const { from, to, subject, html } = req.body;

  if (!from || !to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
