import { ISendMailoptions } from "../Types/Interfaces";
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EventEmitter } from "node:events";


const sendEmailService = async ({ to, subject, html, cc }: ISendMailoptions) => {

    try {
        if (to && subject && html) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            } as SMTPTransport.Options)

            const info = transporter.sendMail({
                from: `E-Commerce Project <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                cc
            } as ISendMailoptions)

            return info
        }
        console.log('send email faild');
    } catch (error) {
        console.log('send email error : ', error);
        throw error
    }
}

export const sendEmail = new EventEmitter()

sendEmail.on("sendEmail", ({ to, subject, html, cc }: ISendMailoptions) => {
    try {
        console.log('sending email...');
        sendEmailService({ to, subject, html, cc })
    } catch (error) {
        console.log('send email error : ', error);
        throw error
    }

})

