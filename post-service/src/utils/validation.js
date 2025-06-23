import Joi from "joi";

export const validatePost = (data) => {
  const schema = Joi.object({
    content : Joi.string().min(5).max(1000).required(),
    mediaIds : Joi.array(),
    hashtags : Joi.array(),
  });

  return schema.validate(data);
}