import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import data_en from "../public/data_en.json" with { type: "json" };
import data_ar from "../public/data_ar.json" with { type: "json" };
import data_v2 from "../public/data_v2.json" with { type: "json" };
import nodemailer from 'nodemailer';
import inline from 'web-resource-inliner';
import dotenv from 'dotenv';

dotenv.config();

const gmailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const mailtrapTransporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_EMAIL_USER,
    pass: process.env.MAILTRAP_EMAIL_PASS,
  }
});

const renderEmail = (template, lang, v2) => {
    const folder = v2 ? 'templates_v2' : 'templates';
    const templatePath = path.join(process.cwd(), `public/${folder}/${template}/email.html`);
    const templateData = fs.readFileSync(templatePath, 'utf8');
    const data = v2 ? data_v2 :
        lang === 'ar' ? data_ar : data_en;
    const renderedEmail = Mustache.render(templateData, data);
    return renderedEmail;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    const template = req.query.template;
    const lang = req.query.lang || 'en';
    const v2 = req.query.v2 || false;
    console.log(v2);
    const email = renderEmail(template, lang, v2);
    inline.html({
        fileContent: email,
        images: false,
        relativeTo: path.resolve(process.cwd(), 'public')
    }, function(err, result) {
        if (err) {
            return res.status(200).json({'error': err})
        } else {
            res.writeHead(200, { 'Content-Type':'text/html'});
            return res.end(result);
        }
    });

    return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment variables");
  }

  let body = req.body;
    console.log('cwd', process.cwd());
    console.log(body.mailtrap);
    console.log('version', body.v2)

    const transporter = (body.mailtrap) ? mailtrapTransporter : gmailTransporter;
    const sender = (body.mailtrap) ? process.env.MAILTRAP_EMAIL_USER : process.env.EMAIL_USER;

    if (body.email && body.template && body.lang) {
        inline.html({
            fileContent: renderEmail(body.template, body.lang, body.v2),
            images: false,
            relativeTo: path.resolve(process.cwd(), 'public')
        }, function(err, result) {
            transporter.sendMail({
                from: sender,
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