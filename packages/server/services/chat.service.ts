/* Implementation of chat service using OpenAI API 
   -  Using a type to return only necessary details from the service in an agnostic way
*/

import OpenAI from "openai";
import { conversationRepository } from "../repositories/conversation.repository";
import { Chat } from "openai/resources";

// Implementation of chat service
// OpenAI client setup
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat response type to encapsulte response details from OpenAI
type ChatResponse = {
  id: string;
  message: string;
};

// Public chat service object
// (Was Leaky abstraction because it returns OpenAI response directly)
export const chatService = {
  // Chat service methods would go here
  async sendMessage(
    prompt: string,
    conversationId: string
  ): Promise<ChatResponse> {
    // Call OpenAI API to generate a response
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.2,
      max_output_tokens: 500,
      previous_response_id:
        conversationRepository.getLastResponseId(conversationId),
    });

    // Store the last response ID for the conversation
    conversationRepository.setLastResponseId(conversationId, response.id);

    return { id: response.id, message: response.output_text } as ChatResponse;
  },
};
