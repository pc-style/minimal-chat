import { db } from "../../../db";
import { messages } from "../../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const chatId = getRouterParam(event, "id");
  if (!chatId) {
    throw createError({ statusCode: 400, message: "Chat ID is required" });
  }

  try {
    await db.delete(messages).where(eq(messages.chatId, chatId));
    return { success: true };
  } catch (e) {
    throw createError({ statusCode: 500, message: "Failed to clear messages" });
  }
});
