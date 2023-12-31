import createHttpError from "http-errors";
import { ConversationModel, UserModel } from "../models/index.js";

export const doesConversationExist = async (
  sender_id,
  receiver_id,
  isGroup
) => {
  if (isGroup === false || isGroup === undefined) {
    let convos = await ConversationModel.find({
      isGroup: false,
      $and: [
        { users: { $elemMatch: { $eq: sender_id } } },
        { users: { $elemMatch: { $eq: receiver_id } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (!convos) {
      throw createHttpError.BadRequest("Oops... Something went wrong !");
    }

    convos = await UserModel.populate(convos, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });
    return convos[0];
  } else {
    let convo = await ConversationModel.findById(isGroup)
      .populate("users admin", "-password")
      .populate("latestMessage");

    if (!convo) {
      throw createHttpError.BadRequest("Oops... Something went wrong !");
    }

    convo = await UserModel.populate(convo, {
      path: "latestMessage.sender",
      select: "name email picture status",
    });
    return convo;
  }
};

export const createConversation = async (data) => {
  const newConvo = await ConversationModel.create(data);
  if (!newConvo) {
    throw createHttpError.BadRequest("Oops... Something went wrong !");
  }
  return newConvo;
};

export const populateConversation = async (
  id,
  fieldToPopulate,
  fieldToRemove
) => {
  const populateConvo = await ConversationModel.find({ _id: id }).populate(
    fieldToPopulate,
    fieldToRemove
  );
  if (!populateConvo) {
    throw createHttpError.BadRequest("Oops... Something went wrong !");
  }
  return populateConvo;
};

export const getUserConversation = async (userId) => {
  let conversation;
  await ConversationModel.find({
    users: {
      $elemMatch: { $eq: userId },
    },
  })
    .populate("users", "-password")
    .populate("admin", "-password")
    .populate("latestMessage")
    .sort({
      updatedAt: -1,
    })
    .then(async (results) => {
      results = await UserModel.populate(results, {
        path: "latestMessage.sender",
        select: "name email picture status",
      });
      conversation = results;
    })
    .catch((err) => {
      throw createHttpError.BadRequest("Oops... Something went wrong !");
    });

  return conversation;
};

export const updateLatestMessage = async (convo_id, msg) => {
  const updatedConvo = await ConversationModel.findByIdAndUpdate(convo_id, {
    latestMessage: msg,
  });
  if (!updatedConvo)
    throw createHttpError.BadRequest("Oops...Something went wrong !");

  return updatedConvo;
};
