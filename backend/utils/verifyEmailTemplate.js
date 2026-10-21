const verifyEmailTemplate = ({ name, url }) => {
    return `
<p>Dear ${name}</p>    
<p>Thank you for registering on Krishna Sweets.</p>   

<p>Best regards,</p>
<p>Krishna Sweets</p>
`
}

export default verifyEmailTemplate