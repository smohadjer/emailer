import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import data from "../public/data.json" assert { type: "json" };
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
  }

  let body = req.body;
    console.log('body', body);
    console.log('typeof body', typeof body);
    console.log('email:', body.email);
    console.log('template:', body.template);
    console.log('cwd', process.cwd());

    if (body.email && body.template) {
        const templatePath = path.join(process.cwd(), `public/templates/${body.template}/email_en.html`);
        const template = fs.readFileSync(templatePath, 'utf8');
        const renderedEmail = Mustache.render(template, data);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: body.email,
            subject: `Testing ${body.template} email template`,
            text: "text version of email",
            html: renderedEmail
        }).then(info => {
            console.log("Email sent:", info.messageId);
            return res.status(200).json({ data: info });
        }).catch(error => {
            console.error("Error sending email:", error);
            return res.status(501).json({ error });
        }); 
    } else {
        res.status(501).json({ error: "Missing email or template in request body" });
    }
}