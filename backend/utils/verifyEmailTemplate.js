const verifyEmailTemplate = ({name,url})=>{
    return`
<p>Dear ${name}</p>    
<p>Thank you for registering on Krishna Sweets.</p>   
<a href=${url} style="color:black;background :orange;margin-top : 10px,padding:20px,display:block">
    Verify Email
</a>
<p>Best regards,</p>
<p>Krishna Sweets</p>
`
}

export default verifyEmailTemplate