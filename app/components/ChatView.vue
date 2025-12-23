<template>
  <div class="flex-1 flex flex-col h-full">
    <!-- header -->
    <header
      class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    >
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"
          >
            <UIcon name="i-lucide-sparkles" class="text-white" />
          </div>
          <div>
            <h2 class="font-medium text-gray-900 dark:text-white">AI Assistant</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span
                class="w-2 h-2 rounded-full"
                :class="isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'"
              />
              {{ isLoading ? "Thinking..." : "Online" }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="sm"
            title="Clear chat"
          />
          <UButton
            icon="i-lucide-settings"
            color="neutral"
            variant="ghost"
            size="sm"
            title="Settings"
          />
        </div>
      </div>
    </header>

    <!-- messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div class="max-w-3xl mx-auto p-6 space-y-6">
        <!-- empty state -->
        <div
          v-if="messages.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <div class="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-message-circle" class="text-3xl text-primary-500" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Start a conversation
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Ask me anything! I can help with coding, writing, analysis, and much more.
          </p>
          <div class="flex flex-wrap gap-2 mt-6 justify-center">
            <UButton
              v-for="suggestion in suggestions"
              :key="suggestion"
              :label="suggestion"
              color="neutral"
              variant="soft"
              size="sm"
              class="text-xs"
              @click="useSuggestion(suggestion)"
            />
          </div>
        </div>

        <!-- message list -->
        <ChatMessage
          v-for="(msg, i) in messages"
          :key="i"
          :is-user="msg.role === 'user'"
          :content="msg.content"
          :is-loading="isLoading && i === messages.length - 1 && msg.role === 'assistant'"
        />
      </div>
    </div>

    <!-- input area -->
    <div class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div class="max-w-3xl mx-auto">
        <div class="relative flex items-end gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2 shadow-inner">
          <UTextarea
            v-model="input"
            :rows="1"
            autoresize
            :maxrows="6"
            placeholder="Type your message..."
            variant="none"
            class="flex-1 bg-transparent resize-none"
            :ui="{ base: 'bg-transparent focus:ring-0 border-0' }"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="flex items-center gap-1 pb-1">
            <UButton
              icon="i-lucide-paperclip"
              color="neutral"
              variant="ghost"
              size="sm"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            />
            <UButton
              icon="i-lucide-send"
              color="primary"
              size="sm"
              :disabled="!input.trim() || isLoading"
              :loading="isLoading"
              class="rounded-xl shadow-md shadow-primary-500/20"
              @click="sendMessage"
            />
          </div>
        </div>
        <p class="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: "user" | "assistant";
  content: string;
}

const props = defineProps<{
  chatId: string;
}>();

const input = ref("");
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const suggestions = [
  "Explain quantum computing",
  "Write a poem about coding",
  "Help me debug my code",
  "What's the weather like?",
];

function useSuggestion(text: string) {
  input.value = text;
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

async function loadMessages() {
  try {
    const data = await $fetch<{ messages: Message[] }>(`/api/chats/${props.chatId}`);
    messages.value = data.messages.filter((m) => m.role === "user" || m.role === "assistant");
    scrollToBottom();
  } catch {
    // new chat
  }
}

async function sendMessage() {
  if (!input.value.trim() || isLoading.value) return;

  const userMessage = input.value;
  input.value = "";
  isLoading.value = true;

  messages.value.push({ role: "user", content: userMessage });
  messages.value.push({ role: "assistant", content: "" });
  const assistantIndex = messages.value.length - 1;
  scrollToBottom();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: props.chatId,
        messages: messages.value.slice(0, -1),
      }),
    });

    if (!response.ok) throw new Error("API error");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let lineEnd;
      while ((lineEnd = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              messages.value[assistantIndex].content += parsed.content;
              scrollToBottom();
            }
          } catch {
            // ignore
          }
        }
      }
    }
  } catch {
    messages.value[assistantIndex].content = "Sorry, I encountered an error. Please try again.";
  }

  isLoading.value = false;
}

onMounted(loadMessages);
</script>
