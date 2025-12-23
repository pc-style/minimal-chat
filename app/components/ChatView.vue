<template>
  <div class="flex-1 flex flex-col h-full bg-neutral-50/50 dark:bg-neutral-950/50">
    <!-- header -->
    <header class="h-16 flex items-center justify-between px-6 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50"
        >
          <div
            class="w-2 h-2 rounded-full transition-colors"
            :class="isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"
          />
          <span class="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {{ isLoading ? "Thinking..." : "Ready" }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-trash-2"
          @click="clearChat"
        />
      </div>
    </header>

    <!-- messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div class="max-w-3xl mx-auto py-10 px-6">
        <!-- empty state for this chat -->
        <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-message-circle" class="text-3xl text-neutral-400" />
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Start a new conversation</h3>
          <p class="text-neutral-500 dark:text-neutral-400 max-w-sm mt-2">
            Ask anything - from complex code to creative writing. Apple Intelligence is here to help.
          </p>
        </div>

        <!-- messages -->
        <div class="space-y-8">
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

    <!-- input area -->
    <div class="p-6">
      <div class="max-w-3xl mx-auto">
        <div 
          class="relative group transition-all duration-300 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 shadow-sm focus-within:shadow-xl focus-within:border-primary-500/50 dark:focus-within:border-primary-400/30 ring-0 focus-within:ring-4 focus-within:ring-primary-500/10"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            rows="1"
            placeholder="Ask me anything..."
            class="w-full resize-none bg-transparent px-5 py-4 pr-14 text-[15px] leading-relaxed placeholder:text-neutral-400 focus:outline-none transition-all"
            :disabled="isLoading"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="absolute right-3 bottom-3 flex items-center gap-2">
            <Transition name="fade">
              <button
                v-if="input.trim() || isLoading"
                class="flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-lg"
                :class="
                  input.trim() && !isLoading
                    ? 'bg-primary-500 text-white hover:bg-primary-600 scale-100'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400'
                "
                :disabled="!input.trim() || isLoading"
                @click="sendMessage"
              >
                <UIcon v-if="isLoading" name="i-lucide-loader-2" class="text-lg animate-spin" />
                <UIcon v-else name="i-lucide-arrow-up" class="text-xl" />
              </button>
            </Transition>
          </div>
        </div>
        <p class="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-3 tracking-wide flex items-center justify-center gap-2">
          <span>AI can make mistakes. Consider checking important information.</span>
          <span class="opacity-30">•</span>
          <span><kbd class="font-sans opacity-60">⌘ + Enter</kbd> to send</span>
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
  const newHeight = Math.min(inputRef.value.scrollHeight, 240);
  inputRef.value.style.height = newHeight + "px";
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
              if (parsed.content && messages.value[assistantIndex]) {
                messages.value[assistantIndex]!.content += parsed.content;
                scrollToBottom();
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      if (messages.value[assistantIndex]) {
        messages.value[assistantIndex]!.content = "Something went wrong. Please try again.";
      }
    }

  isLoading.value = false;
}

onMounted(loadMessages);
</script>

<style>
.message-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.message-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #1e293b;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
