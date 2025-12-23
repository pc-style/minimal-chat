import { db } from "../db";
import { messages as messagesTable, chats } from "../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userMessages = body.messages ?? [];
  const chatId: string | undefined = body.chatId;

  // save user message to db
  if (chatId && userMessages.length > 0) {
    const lastMsg = userMessages[userMessages.length - 1];
    if (lastMsg.role === "user") {
      await db.insert(messagesTable).values({
        id: crypto.randomUUID(),
        chatId,
        role: "user",
        content: lastMsg.content,
      });

      // update chat title from first message
      const existing = await db.select().from(messagesTable).where(eq(messagesTable.chatId, chatId));
      if (existing.length === 1) {
        const title = lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? "..." : "");
        await db.update(chats).set({ title, updatedAt: new Date() }).where(eq(chats.id, chatId));
      }
    }
  }

  // call apple intelligence api
  const response = await fetch("http://localhost:8080/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "base",
      messages: userMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw createError({ statusCode: response.status, message: "API error" });
  }

  // collect full response for saving
  let fullResponse = "";

  // stream the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // process complete lines
          let lineEnd;
          while ((lineEnd = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);

            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }

        // save assistant response
        if (chatId && fullResponse) {
          await db.insert(messagesTable).values({
            id: crypto.randomUUID(),
            chatId,
            role: "assistant",
            content: fullResponse,
          });
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
