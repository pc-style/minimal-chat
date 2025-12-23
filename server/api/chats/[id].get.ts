import { db } from "../../db";
import { chats, messages } from "../../db/schema";
import { eq, asc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "Chat ID is required" });
  }

  const chat = await db.select().from(chats).where(eq(chats.id, id)).limit(1);

  if (!chat.length) {
    throw createError({ statusCode: 404, message: "Chat not found" });
  }

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, id))
    .orderBy(asc(messages.createdAt));

  return {
    ...chat[0],
    messages: chatMessages,
  };
});
