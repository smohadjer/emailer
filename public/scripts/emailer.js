/* this is a node.js script that populates a mustache template with data and send it out as html email */

const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const data = require('../data.json');
const nodemailer = require("nodemailer");

require("dotenv").config();

// Load the email template
const templatePath = path.join(__dirname, '../templates/responder_new/email_en.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Render the template with data
const renderedEmail = Mustache.render(template, data);

// Output the rendered email to a file
// const outputPath = path.join(__dirname, 'output_email.html');
// fs.writeFileSync(outputPath, renderedEmail);
// console.log('Email generated at:', outputPath);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
}

console.log("Sending email from:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  cc: process.env.EMAIL_CC,
  subject: "Email test",
  text: "Sent from Node.js",
  html: renderedEmail
}).then(info => {
  console.log("Email sent:", info.messageId);
}).catch(error => {
  console.error("Error sending email:", error);
}); 
