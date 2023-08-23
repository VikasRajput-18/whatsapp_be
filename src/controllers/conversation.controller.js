import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
import {
  doesConversationExist,
  createConversation,
  populateConversation,
  getUserConversation,
} from "../services/conversation.service.js";
import { findUser } from "../services/user.service.js";

export const create_open_conversation = async (req, res, next) => {
  try {
    const sender_id = req.user.userId;
    const { receiver_id } = req.body;
    if (!receiver_id) {
      logger.error("Please provide a receiver id to chat with him/her.");
      throw createHttpError.BadGateway("Oops... Somehting went wrong");
    }

    // check if chat alerady exist
    const existed_conversation = await doesConversationExist(
      sender_id,
      receiver_id
    );

    if (existed_conversation) {
      res.json(existed_conversation);
    } else {
      let receiver_user = await findUser(receiver_id);
      let convoData = {
        name: receiver_user.name,
        isGroup: false,
        users: [sender_id, receiver_id],
      };

      const newConvo = await createConversation(convoData);
      const populatedConvo = await populateConversation(
        newConvo._id,
        "users",
        "-password"
      );
      await res.status(200).json(populatedConvo);
    }
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const conversation = await getUserConversation(user_id);
    res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
};