import { db } from "../../db";
import { chats } from "../../db/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async () => {
  const allChats = await db
    .select()
    .from(chats)
    .orderBy(desc(chats.updatedAt));

  return allChats;
});
