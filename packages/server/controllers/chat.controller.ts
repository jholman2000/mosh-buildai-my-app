import type { Request, Response } from "express";
import z from "zod";
import { chatService } from "../services/chat.service";

// Zod schema for request validation (Implemenmtation detail that is hidden from controller users)
const chatRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(1000, "Prompt is too long (max 1000 characters)"),
  conversationId: z.uuid("Invalid conversation ID"),
});

// Public chat controller object interface
// Controller calls chat service after validating request
//
export const chatController = {
  sendMessage: async (req: Request, res: Response) => {
    console.log("[Controller] sendMessage called");
    // Validate request body first using Zod schema
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.format() });
      return;
    }

    try {
      // Now calling the chat service to get a response
      const { prompt, conversationId } = req.body;
      //   console.log(
      //     `[Controller] Received prompt: ${prompt} for conversationId: ${conversationId}`
      //   );
      const response = await chatService.sendMessage(prompt, conversationId);

      //   console.log(`Responding: ${response.message}`);
      res.json({ message: response.message });
    } catch (error) {
      //console.error("Error processing chat request:", error);
      res.status(500).json({ error: "Failed to generate a response" });
    }
  },
};
