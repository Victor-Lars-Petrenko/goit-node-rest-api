import express from "express";

import {
  register,
  login,
  getCurrent,
  logout,
  updateUserSubscription,
} from "../controllers/authControllers.js";

import { authenticate } from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, logout);

authRouter.patch("/", authenticate, updateUserSubscription);

export default authRouter;
