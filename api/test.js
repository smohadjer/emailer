import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import data_en from "../public/data_en.json" with { type: "json" };
import data_ar from "../public/data_ar.json" with { type: "json" };
import nodemailer from 'nodemailer';
import inline from 'web-resource-inliner';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  } else {
    return res.status(200).json({'text': 'hello'})
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
  }

  let body = req.body;
    console.log('cwd', process.cwd());

    if (body.email && body.template && body.lang) {
        const templatePath = path.join(process.cwd(), `public/templates/${body.template}/email_${body.lang}.html`);
        const template = fs.readFileSync(templatePath, 'utf8');
        const data = body.lang === 'ar' ? data_ar : data_en;
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
        inline.html({
            fileContent: renderedEmail,
            images: false,
            relativeTo: path.resolve(process.cwd(), 'public')
        }, function(err, result) {
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: body.email,
                subject: `Testing ${body.template} email template`,
                text: "text version of email",
                html: result
            }).then(info => {
                console.log("Email sent:", info.messageId);
                return res.status(200).json({ data: info });
            }).catch(error => {
                console.error("Error sending email:", error);
                return res.status(501).json({ error });
            }); 
        });
    } else {
        res.status(501).json({ error: "Missing email or template in request body" });
    }
}