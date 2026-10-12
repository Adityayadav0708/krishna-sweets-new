import jwt from "jsonwebtoken";


//This auth middleware is basically your security guard for protected routes.
// we send cookie from frontend to backend in every request
//Check whether the request contains a valid access token.
// If valid → allow the request to continue.
//  If not → reject it.
export const auth = (req, res, next) => {


    try {

        // we are checking two place to find token
        // 1. cookies  :  when user is login and we send response with set-cookie header then user cookies store in browser
        // 2. headers  :  when user is login and we send response with set-cookie header then user cookies store in browser
        const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1]; //["Bearer", "token"] here we want only token so we have use[1] index 1
        if(!token){
            return res.status(401).json({
                message: "Unauthorized",
                success:false,
                error:true
            });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        if(!decoded){
            return res.status(401).json({
                message: "Unauthorized",
                success:false,
                error:true
            });
        }
        req.user = decoded;

        next(); // move on to the next route handler Authentication successful. Go to the next middleware/controller.
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token.",
        success:false,
        error:true
    });
    }
};
