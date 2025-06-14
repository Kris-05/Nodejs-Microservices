import Joi from "joi";

export const validateRegistration = (data) => {
  const schema = Joi.object({
    username : Joi.string().min(6).max(20).required(),
    email : Joi.string().email().required(),
    password : Joi.string().min(8).required(),
    name : Joi.string().required(),
    age: Joi.number().integer().min(18).required(),
    mobile : Joi.string().required()
  });

  return schema.validate(data);
}