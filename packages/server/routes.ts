import express from "express";
import type { Request, Response } from "express";
import { chatController } from "./controllers/chat.controller";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello from server");
});

router.get("/api/hello", (req: Request, res: Response) => {
  //res.send("Hi Jeff!");
  //console.log("Hello endpoint called");
  res.json({ message: "Hello server world" });
});

// Chat endpoint
router.post("/api/chat", chatController.sendMessage);

export default router;
