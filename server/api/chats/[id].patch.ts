import { db } from "../../db";
import { chats } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, message: "Chat ID is required" });
  }

  const updates: Partial<{ title: string; updatedAt: Date }> = {
    updatedAt: new Date(),
  };

  if (body.title) updates.title = body.title;

  const updated = await db
    .update(chats)
    .set(updates)
    .where(eq(chats.id, id))
    .returning();

  if (!updated.length) {
    throw createError({ statusCode: 404, message: "Chat not found" });
  }

  return updated[0];
});
