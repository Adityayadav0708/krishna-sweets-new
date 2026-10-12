import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyEmailTemplate from "../../utils/verifyEmailTemplate.js";
import sendEmail from "../config/sendEmail.js";
import crypto from "crypto";
import generateAccessToken from "../../utils/generateAccessToken.js";
import generateRefreshToken from "../../utils/generatedRefreshToken.js";
import uploadImageClodinary from "../../utils/uploadImagecloudinary.js";
import generateOtp from "../../utils/generateOtp.js";
import forgotpasswordTemplate from "../../utils/forgotPasswordTemplate.js";

// signup user  (Register)
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "please provide all fields",
                success: false,
                error: true
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                success: false,
                error: true
            });
        }

        // generate salt
        const salt = await bcrypt.genSalt(10);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, salt);

        // ----------------------------------------------------
        // Generate a secure random token for email verification
        // This token will be sent to the user's email.
        // ----------------------------------------------------
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        // ----------------------------------------------------
        // Hash the verification token before storing it
        // in MongoDB.
        //
        // Raw token  -> Email
        // Hashed token -> Database
        //
        // This means even if the database is exposed,
        // the actual verification link cannot be directly used.
        // ----------------------------------------------------
        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        // ----------------------------------------------------
        // Verification token expiry
        // Token will be valid for 15 minutes.
        // ----------------------------------------------------
        const verificationTokenExpires =
            Date.now() + 15 * 60 * 1000;

        // create a new User

        // it used when you save and you have to  for modify  before saving
        const payload = {
            name,
            email,
            password: hashedPassword,

            // Email verification fields
            verify_email: false,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationTokenExpiry: verificationTokenExpires
        };

        const newUser = new User(payload);
        const save = await newUser.save();

        // ----------------------------------------------------
        // Create verification URL
        //
        // IMPORTANT:
        // We send the RAW verification token to the user.
        // We do NOT send the hashed token.
        // ----------------------------------------------------
        const verifyEmailUrl =
            `http://localhost:${process.env.PORT || 5006}/api/auth/verify-email?token=${verificationToken}`;

        // ----------------------------------------------------
        // Send verification email using Resend
        // ----------------------------------------------------
        await sendEmail({
            to: email,
            subject: "Verify email from Krishna Sweets",
            html: verifyEmailTemplate({
                name,
                url: verifyEmailUrl
            })
        })

        // ----------------------------------------------------
        // Don't return the complete user document.
        // The document contains the hashed password and
        // verification token.
        // ----------------------------------------------------
        return res.status(201).json({
            message:
                "User signup successfully. Please verify your email.",
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Signup Error:", error.message);

        return res.status(500).json({
            message: "Server Error",
            error: true,
            success: false
        });
    }
};


// verify email controller
// when click on verify email what happens
const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;

        // check token is provided
        if (!token) {
            return res.status(400).json({
                message: "Token is required",
                success: false,
                error: true
            });
        }

        //hash token 
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        //find user by token 
        const user = await User.findOne({emailVerificationToken:hashedToken});

        //check user is verified 
        if(!user){
            return res.status(400).json({
                message:"Invalid token",
                success:false,
                error:true
            });
        }

        //check token is expired 
        if (!user.emailVerificationTokenExpiry || new Date(user.emailVerificationTokenExpiry).getTime() < Date.now()) {
            return res.status(400).json({
                message:"Token is expired",
                success:false,
                error:true
            });
        }

        //verify user email
        user.verify_email = true;
        user.emailVerificationToken = null;
        user.emailVerificationTokenExpiry = null;

        await user.save();

        return res.status(200).json({
            message:"Email verified successfully",
            success:true,
            error:false
        });

    } catch (error) {
        console.error("Verify Email Error:", error.message);

        return res.status(500).json({
            message: "Server Error",
            error: true,
            success: false
        });
    }
};


// login user
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        //find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success : false,
                error : true
            });
        }
//check weather user,s email is verified 
if(!user.verify_email){
    return res.status(400).json({
        message:"Please verify your email before login",
        success:false,
        error:true
    })
}


        if(user.status?.toLowerCase() !== "active"){
            return res.status(400).json({
                message : "Contact to Admin",
                error : true,
                success : false
            })
        }


        //compare password { current password with hashed password in database}
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
                success : false,
                error : true
            });
        }

     

        //generate access token and refresh token
        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        // security fetaute of cookie 
        const cookieOption={
            httpOnly:true,

            // means the cookie should be sent only over: HTTPS
            // secure:true,



            secure:false,


            // The `sameSite: "None"` flag is required for cookies to work across different domains,
            // such as between frontend (e.g., localhost:5173) and backend (localhost:5006).
            // sameSite:"None"
            sameSite:"Lax"
        }
        // sending data over cookie 
        res.cookie('accessToken',accessToken,cookieOption)
        res.cookie('refreshToken',refreshToken,{...cookieOption,maxAge:7*24*60*60*1000})
        
        //save ref token in db 
        user.refreshToken = refreshToken;

        // store last_login_date in user collection 
        user.last_login_date = new Date();
        await user.save();

        // ye frontend ko milega
        res.status(200).json({
            message: "Login successful",
            success:true,
            error:false,
            // token: accessToken,
            // accessToken,
            // refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatar: user.avatar || '',
                refreshToken: refreshToken,
                accessToken: accessToken
            }
        });

    } catch (err) {
        console.error("Login Error:", err.message);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// logout 
const logout = async (req, res) => {
    try {
      const cookieOption= {
            httpOnly:true,
            // secure:true,
            secure:false,
            // sameSite:"None"
            sameSite:"Lax"
        }

        const userId = req.user.id; // from middleware

        await User.findByIdAndUpdate(userId, { refreshToken: "" });
// ✅ Also clear browser cookies
res.clearCookie("accessToken",cookieOption);
res.clearCookie("refreshToken",cookieOption);


  

     return res.status(200).json({
            message: "Logout successful",
            success:true,
            error:false
        });
    } catch (error) {
        console.error("Logout Error:", error.message);
        res.status(500).json({
            message: "Server Error",
            success:false,
            error:true
        });
    }
};






// upload user avtar
const uploadAvatar = async(req,res)=>{
    try {
        const userId=req.userId//auth middleware

const image = req.file; // from multer

if(!image){
    return res.status(400).json({
        message: "Please upload an image",
        success:false,
        error:true
    })
}

const upload=await uploadImageClodinary(image)
const updatedUser=await User.findByIdAndUpdate(userId,{
    avatar:upload.url
})
// console.log("image",image); 

return res.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : req.user.id,
                avatar :upload.url
            }
        })

        
    } catch (error) {
        res.status(400).json({
            message: "Server Error",
            success:false,
            error:true
        })
        
    }
}
//update user details when loggedin 
const updateUserDetails= async(req,res)=>{
    try {

        const userId = req.user.id //auth middleware (Only login user can do this )
        const { name, email, mobile, password } = req.body 

        let hashPassword = ""

        if(password){
            const salt = await bcrypt.genSalt(10)
            hashPassword = await bcrypt.hash(password,salt)
        }
// use updateone dont use findbyidandupdate this send data of previous data 
        const updateUser = await User.updateOne({ _id : userId},{
            ...(name && { name : name }),
            ...(email && { email : email }),
            ...(mobile && { mobile : mobile }),
            ...(password && { password : hashPassword })
        })

        return res.json({
            message : "Updated successfully",
            error : false,
            success : true,
            data : updateUser
        })


    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


// forget password when not login  ================================


const forgotPassword= async(req,res)=>{
    try {
        const {email}=req.body;

        // check email are provided
        if(!email){
            return res.status(400).json({
                message:"Please provide email",
                success:false,
                error:true
            })
        }

        //check email is exist or not
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
                message:"Email not found",
                success:false,
                error:true
            })
        }
        //generate otp
        const otp=await generateOtp();
        const expireTime=new Date(Date.now() + 10*60*1000); // 10 minutes from now

        //Update user in db     
        const update=await User.updateOne({email:email},{
            forgot_password_otp:otp,
            forgot_password_otp_expiry:expireTime
        })
        await sendEmail({
            to:email,
            subject:"forgot password for krishnasweets",
            html:forgotpasswordTemplate({
                name:user.name,
                otp:otp,
            })
        })
        // if(update.modifiedCount==0){
        //     return res.status(400).json({
        //         message:"Email not found",
        //         success:false,
        //         error:true
        //     })
        // }
        return res.json({
            message:"OTP sent successfully",
            success:true,
            error:false
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}


//verify forgot password otp when not login 
const verifyForgotPasswordOtp = async (req, res) => {
    try {
        const {email, otp } = req.body
        if(!email || !otp){
            return res.status(400).json({
                message: "Please provide email and OTP",
                success:false,
                error:true
            })
        }
        const user = await User.findOne({ forgot_password_otp: otp })
        if (!user) {
            return res.status(400).json({
                message: "OTP is incorrect",
                success: false,
                error: true
            })

        }
        const currentTime=new Date().toISOString()
        if (user.forgot_password_otp_expiry < currentTime) {
            return res.status(400).json({
                message: "OTP is expired",
                success: false,
                error: true
            })
        }
        if(otp != user.forgot_password_otp){
            return res.status(400).json({
                message: "Invalid OTP",
                success: false,
                error: true
            })
        }
// if otp not expire 
//otp === user.forgot_password_otp 
//then user change password
        await User.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_otp_expiry : null
        })
        return res.json({
            message: "OTP is verified successfully",
            success: true,
            error: false
        })
} catch (error) {
    return res.status(500).json({
        message: error.message || error,
        error: true,
        success: false
    })
}
}





// Reset the password
const resetPassword = async (req, res) => {
    try {
        const {email, newPassword,confirmedPassword } = req.body
        if(!email || !newPassword || !confirmedPassword){
            return res.status(400).json({
                message: "Please provide email and new and confirmed password",
                success:false,
                error:true
            })
        }
        if(newPassword != confirmedPassword){
            return res.status(400).json({
                message: "newPassword and confirmedPassword are not matching",
                success:false,
                error:true
            })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Email not found",
                success: false,
                error: true
            })

        }
        // password must be atleast 6 character
        if(newPassword.length < 6){
            return res.status(400).json({
                message: "Password must be atleast 6 characters",
                success:false,
                error:true
            })
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPassword,salt)
        const updateUser = await User.findByIdAndUpdate(user._id,{
            password : hashPassword,
            forgot_password_otp : "",
            forgot_password_otp_expiry : ""
        })
        return res.json({
            message: "Password reset successfully",
            success: true,
            error: false
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


// Refresh token controller api it gen acces token 
const refreshToken = async(req,res)=>{
    try{
        // get token from cookie or header authorization
        const refreshToken=req.cookies.refreshToken ||req?.headers?.authorization?.split(" ")[1]; 
        if(!refreshToken){
            return res.status(400).json({
                message: "Refresh token is required",
                success:false,
                error:true
            })
}
// verify token
const verifyToken = jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN);
if(!verifyToken){
    return res.status(400).json({
        message: "Invalid token",
        success:false,
        error:true
    })
}
     const userId = verifyToken?._id;
     const newAccessToken= await generateAccessToken(userId)

     const cookiesOptions = {
        httpOnly: true,
        // yaha pr false rakho abhi http pr hoga yaha 
        secure: false,
        sameSite: "None"
       
     }
     res.cookie("accessToken",newAccessToken,cookiesOptions);

     return res.json({
        message: " new access token generated successfully",
        success: true,
        error: false,
        accessToken:newAccessToken,
     })
    }
    catch(err){
    return res.status(500).json({
        message: err.message || err,
        error: true,
        success: false
    })
    }
}




// get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId || request.user?.id || request.user?._id;

        if (!userId) {
            return response.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            });
        }

        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Something is wrong",
            error: true,
            success: false
        });
    }
}



export {
    signup,
    verifyEmail,
    LoginUser,
    logout,uploadAvatar,
    updateUserDetails,forgotPassword,verifyForgotPasswordOtp,resetPassword,refreshToken
};