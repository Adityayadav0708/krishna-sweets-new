import User from "../src/models/User.js";
import jwt from "jsonwebtoken";

const generateRefreshToken = async (userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: "7d" }
    );

    await User.updateOne(
        { _id: userId },
        {
            refreshToken: token
        }
    );

    return token;
};

export default generateRefreshToken;