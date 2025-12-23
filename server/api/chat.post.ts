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
      // ensure chat exists (defensive check)
      const chatExists = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
      if (chatExists.length === 0) {
        await db.insert(chats).values({ id: chatId, title: lastMsg.content.slice(0, 50) });
      }

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

  const debug = process.env.DEBUG === 'true';
  const debugLog = (...args: any[]) => {
    if (debug) console.log(...args);
  };
  const debugError = (...args: any[]) => {
    if (debug) console.error(...args);
  };

  debugLog("Chat handler started, chatId:", chatId);

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

  debugLog("Apple Intelligence API response status:", response.status);

  if (!response.ok) {
    throw createError({ statusCode: response.status, message: "API error" });
  }

  // collect full response for saving
  let fullResponse = "";

  // stream the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      debugLog("ReadableStream start");
      const reader = response.body?.getReader();
      if (!reader) {
        debugError("No reader for response body");
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            debugLog("Backend reader done");
            break;
          }

          const decodedValue = decoder.decode(value, { stream: true });
          debugLog("Backend received value part:", decodedValue);
          buffer += decodedValue;

          // process complete lines
          let lineEnd;
          while ((lineEnd = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);

            if (line.startsWith("data:")) {
              const data = line.startsWith("data: ") ? line.slice(6) : line.slice(5);
              if (data === "[DONE]") {
                debugLog("Backend received [DONE]");
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content !== undefined && content !== null) {
                  debugLog("Enqueuing content:", content);
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch (e) {
                debugError("Backend JSON parse error for data:", data, e);
              }
            }
          }
        }

        // save assistant response
        if (chatId && fullResponse) {
          debugLog("Saving assistant response, length:", fullResponse.length);
          await db.insert(messagesTable).values({
            id: crypto.randomUUID(),
            chatId,
            role: "assistant",
            content: fullResponse,
          });
        }

        debugLog("Closing controller");
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        debugError("Stream catch error:", e);
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
