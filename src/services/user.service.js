import createHttpError from "http-errors";
import { UserModel } from "../models/index.js";

export const findUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) throw createHttpError.BadRequest("Please fill all fields.");
    return user;
  } catch (error) {
    throw createHttpError.BadGateway("Server Error");
  }
};

export const searchUsers = async (keyword , userId) => {
  const users = await UserModel.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
  }).find({
    _id:{$ne : userId}
  });

  return users;
};
