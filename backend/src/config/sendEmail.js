import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

if(!process.env.RESEND_API_KEY){
    console.log("Provide RESEND_API in side the .env file")
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({to,subject ,html}) => {
	try{



		
		const { data, error } = await resend.emails.send({
			from: "Krishna Sweet <onboarding@resend.dev>",
			to: to,
			subject: subject,
			html: html,
  });

   if (error) {
            return console.error({ error });
        }
		return data;
	}
	catch(error){
		console.log("Something went wrong in sending email")
	}
}
export default sendEmail;
