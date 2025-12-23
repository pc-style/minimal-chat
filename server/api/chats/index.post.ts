import { db } from "../../db";
import { chats } from "../../db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const id = crypto.randomUUID();
  const newChat = await db
    .insert(chats)
    .values({
      id,
      title: body?.title ?? "New Chat",
    })
    .returning();

  return newChat[0];
});
