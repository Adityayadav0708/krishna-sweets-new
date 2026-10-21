import nodemailer from "nodemailer";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// Create Nodemailer Gmail transporter if EMAIL_USER and EMAIL_PASS are provided
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            // Automatically strip spaces if the user pasted Google's 16-character format with spaces
            pass: process.env.EMAIL_PASS.replace(/\s+/g, ""),
        },
    });
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async ({ to, subject, html }) => {
    // 1. Primary: Use Nodemailer (Gmail) — Works with ANY recipient email address without requiring a domain!
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"Krishna Sweets" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            return info;
        } catch (error) {
            console.error(`[Gmail SMTP Error for ${to}]:`, error.message);
            throw error;
        }
    }

    // 2. Fallback: Use Resend if configured
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: process.env.RESEND_FROM || "Krishna Sweet <onboarding@resend.dev>",
                to,
                subject,
                html,
            });

            if (error) {
                console.warn(`[Resend Notice]: Could not send to ${to}. Reason:`, error.message);
                throw new Error(error.message || "Failed to send email via Resend");
            }
            return data;
        } catch (error) {
            console.warn(`[Email Service Notice for ${to}]:`, error.message);
            throw error;
        }
    }

    console.warn(`[Email Warning]: Neither Gmail credentials (EMAIL_USER, EMAIL_PASS) nor RESEND_API_KEY configured.`);
    throw new Error("No email provider configured. Please set EMAIL_USER and EMAIL_PASS in your .env file.");
};

export default sendEmail;
