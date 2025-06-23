import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
  }, 
  post : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Post",
  },
  createdAt : {
    type : Date,
    default : Date.now(),
  }
}, { timestamps : true });

// Compound index to ensure 1 like per user per post
likeSchema.index({ user : 1, post : 1 }, { unique : true });

// for faster post queries
likeSchema.index({ post : 1 }); 

const Like = new mongoose.model("Like", likeSchema);
export default Like;