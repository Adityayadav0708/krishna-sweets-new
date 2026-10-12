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

// getaddress by ID
const getAddressByUserId =async(req,res)=>{
    try{
        const address=await Address.find({
            userId:req.params.userId
        }).populate({path:"userId",select:"name"})

        res.json({success:true,message:"address fetched successfully",address})
    }
    catch(error){
        res.status(500).json({message:"internal server error"})
    }
    
}
export {setAddress,getAddressByUserId}
