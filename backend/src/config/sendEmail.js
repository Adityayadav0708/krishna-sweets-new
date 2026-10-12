import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

if(!process.env.RESEND_API_KEY){
    console.log("Provide RESEND_API in side the .env file")
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "Krishna Sweet <onboarding@resend.dev>",
			to: to,
			subject: subject,
			html: html,
		});

		if (error) {
			console.warn(`[Resend Sandbox Notice]: Could not send to ${to}. Reason:`, error.message);
			throw new Error(error.message || "Failed to send email via Resend");
		}
		return data;
	} catch (error) {
		console.warn(`[Email Service Notice for ${to}]:`, error.message);
		throw error;
	}
};
export default sendEmail;
