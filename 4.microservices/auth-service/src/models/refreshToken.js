import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true
  }, 
  token : {
    type : String,
    required : true,
    unique : true,
  },
  expiresAt : {
    type : Date,
    required : true
  }
}, { timestamps : true });

// 1 (or -1) is for sorting/indexing (ascending/descending).
// makes it a TTL index: documents will be automatically deleted when the expiresAt date is reached.
refreshTokenSchema.index({expiresAt : 1}, {expireAfterSeconds : 0});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
