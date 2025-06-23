import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
  username : {
    type : String,
    required : true,
    unique : true,
    trim : true,
  },
  email : {
    type : String,
    required : true,
    unique : true,
    trim : true,
    lowercase : true
  },
  password : {
    type : String,
    required : true,
  },
  name : {
    type :String,
    required : true,
    trim : true
  },
  age : {
    type : Number,
    min : 18, // age should be >= 18
    required : true,
  },
  mobile : {
    type : String, // as they can have country codes
    required : true
  },
  createdAt : {
    type : Date,
    default : Date.now
  }
}, { timestamps : true });

userSchema.pre('save', async function hashPassword(next){
  if(this.isModified('password')){
    try {
      this.password = await argon2.hash(this.password);
    } catch (e) {
      return next(e);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (e) {
    throw e;
  }
};

userSchema.methods.changePassword = async function(oldPassword, newPassword) {
  // Verify old password
  const isMatch = await argon2.verify(this.password, oldPassword);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }
  // Set new password (will be hashed by pre-save hook)
  this.password = newPassword;
  await this.save();
  return true;
};

userSchema.index({username : 'text'});

const User = mongoose.model('User', userSchema);
export default User;