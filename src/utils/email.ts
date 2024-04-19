import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import { Prisma } from '@prisma/client';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const smtp = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    port: process.env.SMTP_PORT,
    host: process.env.SMTP_HOST,
}

export default class Email {
    private firstName: string
    private to: string
    private from: string

    constructor(private user: Prisma.UserCreateInput, private url: string) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.from = `Natours <${process.env.EMAIL_FROM}>`
    }

    private newTransport() {
        const options: SMTPTransport.Options = {
            host: smtp.host,
            port: parseInt(smtp.port as string),
            secure: smtp.port === '465',
            auth: {
                user: smtp.user,
                pass: smtp.pass
            }
        }
        
        return nodemailer.createTransport(options)
    }

    private async send(template: string, subject: string) {
        try {
            const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject
            })

            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: convert(html)
            }

            const info = await this.newTransport().sendMail(mailOptions)
            console.log(nodemailer.getTestMessageUrl(info))
        } catch (error) {
            console.log('Error sending email: ', error)
        }
    }

    async sendVerificationCode() {
        await this.send('verificationCode', 'Your account verification code')
    }

    async sendPasswordResetToken() {
        await this.send('passwordResetToken', 'Your password reset token')
    }
}