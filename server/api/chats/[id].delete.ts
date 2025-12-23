import { db } from "../../db";
import { chats } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "Chat ID is required" });
  }

  await db.delete(chats).where(eq(chats.id, id));

  return { success: true };
});
