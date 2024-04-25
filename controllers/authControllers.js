import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";

import HttpError from "../helpers/HttpError.js";

import {
  userSigninSchema,
  userSignupSchema,
  updateSubscriptionSchema,
} from "../schemas/usersSchemas.js";

import { findUser, signup, updateUser } from "../services/authServices.js";

const { JWT_SECRET } = process.env;

const avatarsDir = path.resolve("public", "avatars");

export const register = async (req, res, next) => {
  try {
    const { error } = userSignupSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await findUser({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const avatarURL = gravatar.url(email);

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await signup({ ...req.body, password: hashed, avatarURL });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = userSigninSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await findUser({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id, subscription } = user;
    const payload = { id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

    await updateUser({ _id: id }, { token });
    res.status(201).json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  const { _id } = req.user;
  await updateUser({ _id }, { token: "" });
  res.status(204).json();
};

export const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({ email, subscription });
};

export const updateUserSubscription = async (req, res, next) => {
  try {
    const { error } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { email: emailToFind } = req.body;
    const user = await findUser({ email: emailToFind });
    if (!user) {
      throw HttpError(404);
    }
    const updatedUser = await updateUser({ email: emailToFind }, req.body);
    const { email, subscription } = updatedUser;
    res.status(200).json({ user: { email, subscription } });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    if (!req.file) {
      throw HttpError(400, "Image is not found");
    }
    const { path: tempUpload, originalname } = req.file;

    try {
      const image = await Jimp.read(tempUpload);
      await image.resize(250, 250).writeAsync(tempUpload);
    } catch (error) {
      throw HttpError(500, "File writing error");
    }

    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await updateUser({ _id }, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};
