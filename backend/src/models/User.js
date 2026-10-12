import mongoose from "mongoose";


// signup form
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      required: false,
      default: ""
    },
    refreshToken: {
      type: String,
      default: ""
    },
    emailVerificationToken:{
      type:String,
      default:null
    },
    emailVerificationTokenExpiry:{
      type:Date,
      default:null
    },
    verify_email: {
      type: Boolean,
      default: false
    },
     last_login_date: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },
    address_details: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address"
    }],

      shoppingCart: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart"
    }],
    order_history: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }
    ],

    // forget_password_token
    // forget_password_token: {
    //   type: String,
    //   default: ""
    // },
    forgot_password_otp: {
      type: String,
      default: ""
    }, forgot_password_otp_expiry: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }

  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
export default User;
