import mongoose from "mongoose";
import Like from "./likes.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaIds: [{ type: String }],
    hashtags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

postSchema.statics.didUserLike = async function (userId) {
  const like = await Like.findOne({
    post: this._id,
    user: userId,
  });
  return !!like;
};

postSchema.methods.addLike = async function (userId) {
  try {
    await Like.create({ user: userId, post: this._id });
    this.likeCount += 1;
    await this.save();
    return true;
  } catch (err) {
    if (err.code === 11000) return false; // Already liked
    throw err;
  }
};

postSchema.methods.removeLike = async function (userId) {
  const result = await Like.deleteOne({
    user: userId,
    post: this._id,
  });

  if (result.deletedCount > 0) {
    this.likeCount = Math.max(0, this.likeCount - 1);
    await this.save();
    return true;
  }
  return false; // Like didn't exist
};

postSchema.statics.findByHashtag = async function (hashtag, startIndex, limit) {
  // Remove '#' if included and convert to lowercase
  const cleanHashtag = hashtag.replace(/^#/, "").toLowerCase();
  return this.find({ hashtags: cleanHashtag }).sort({ createdAt: -1 }).skip(startIndex).limit(limit); // Newest first
};

// Indexes for faster queries
postSchema.index({ hashtags: 1 }); // For hashtag-based searches
postSchema.index({ likeCount: -1 }); // For sorting by popularity

const Post = new mongoose.model("Post", postSchema);
export default Post;
