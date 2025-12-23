<template>
  <div class="flex-1 flex flex-col h-full">
    <!-- header -->
    <header class="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full transition-colors"
          :class="isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"
        />
        <span class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ isLoading ? "Generating..." : "Ready" }}
        </span>
      </div>

      <button
        class="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        title="Clear conversation"
        @click="clearChat"
      >
        <UIcon name="i-lucide-trash-2" />
      </button>
    </header>

    <!-- messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto">
      <div class="max-w-2xl mx-auto py-6 px-4">
        <!-- empty state for this chat -->
        <div v-if="messages.length === 0 && !isLoading" class="text-center py-12">
          <p class="text-neutral-400 dark:text-neutral-500 text-sm">
            Send a message to start the conversation
          </p>
        </div>

        <!-- messages -->
        <div class="space-y-6">
          <TransitionGroup name="message">
            <ChatMessage
              v-for="(msg, i) in messages"
              :key="i"
              :is-user="msg.role === 'user'"
              :content="msg.content"
              :is-loading="isLoading && i === messages.length - 1 && msg.role === 'assistant'"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- input -->
    <div class="p-4 border-t border-neutral-200 dark:border-neutral-800">
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <textarea
            ref="inputRef"
            v-model="input"
            rows="1"
            placeholder="Send a message..."
            class="w-full resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 pr-12 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
            :disabled="isLoading"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <button
            class="absolute right-2 bottom-2 p-2 rounded-lg transition-all"
            :class="
              input.trim() && !isLoading
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400'
            "
            :disabled="!input.trim() || isLoading"
            @click="sendMessage"
          >
            <UIcon v-if="isLoading" name="i-lucide-loader-2" class="animate-spin" />
            <UIcon v-else name="i-lucide-arrow-up" />
          </button>
        </div>
        <p class="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-2">
          <kbd class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">Enter</kbd>
          to send
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

const emit = defineEmits<{
  clear: [];
}>();

const input = ref("");
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

function autoResize() {
  if (!inputRef.value) return;
  inputRef.value.style.height = "auto";
  inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 200) + "px";
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: "smooth",
      });
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

function clearChat() {
  messages.value = [];
  emit("clear");
}

async function sendMessage() {
  if (!input.value.trim() || isLoading.value) return;

  const userMessage = input.value;
  input.value = "";
  isLoading.value = true;

  if (inputRef.value) {
    inputRef.value.style.height = "auto";
  }

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
            // ignore parse errors
          }
        }
      }
    }
  } catch {
    messages.value[assistantIndex].content = "Something went wrong. Please try again.";
  }

  isLoading.value = false;
}

onMounted(loadMessages);
</script>

<style>
.message-enter-active {
  transition: all 0.3s ease-out;
}
.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
