// two api req  getadd and set addd

import Address from "../models/Address.js"



//save/set address
const setAddress=async(req,res)=>{
    try {
const address=await Address.create(req.body)
res.json({success:true,message:"address added successfully",address})
    } catch (error) {
        res.status(500).json({message:"internal server error"});
    }
}

import m
ongoose from "mongoose";

// getaddress by ID
const getAddressByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const address = await Address.find({
            userId
        }).populate({ path: "userId", select: "name" });

        res.json({ success: true, message: "address fetched successfully", address });
    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error" });
    }
};
export {setAddress,getAddressByUserId}
