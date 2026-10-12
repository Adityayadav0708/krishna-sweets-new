import mongoose from 'mongoose'

const addressSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        default:null,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:true
    },  
    city:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    pincode:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
}, {timestamps:true});

const address= mongoose.model('Address',addressSchema);
export default address;