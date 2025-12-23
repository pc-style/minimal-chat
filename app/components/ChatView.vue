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
        <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-12 text-center animate-slide-up">
          <div
            class="w-20 h-20 mx-auto rounded-[2rem] bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-2xl shadow-primary-500/40 ring-8 ring-primary-500/10 mb-8"
          >
            <span class="text-white font-black italic tracking-tighter text-3xl select-none">AI</span>
          </div>

          <h3 class="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight mb-4">
            How can I help you today?
          </h3>
          <p class="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-12">
            I'm Apple Intelligence. I can help you write, code, brainstorm, and more.
          </p>

          <div class="grid grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
            <button
              v-for="card in promptCards"
              :key="card.text"
              class="flex flex-col items-center p-6 text-center rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:border-primary-500/50 transition-all group active:scale-[0.98]"
              @click="sendInitialPrompt(card.text)"
            >
              <div class="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-3 group-hover:bg-primary-500/10 transition-colors">
                <UIcon :name="card.icon" class="text-xl text-neutral-400 group-hover:text-primary-500" />
              </div>
              <p class="text-[13px] font-bold text-neutral-800 dark:text-neutral-200">{{ card.text }}</p>
            </button>
          </div>
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
              :font-size="fontSize"
              :show-timestamp="showTimestamps"
              @retry="retryMessage(i)"
            />
          </TransitionGroup>
        </div>
      </div>

      <!-- scroll to bottom -->
      <Transition name="fade">
        <button
          v-if="showScrollButton"
          class="fixed bottom-32 right-8 w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-primary-500 transition-all z-20"
          @click="scrollToBottom"
        >
          <UIcon name="i-lucide-arrow-down" class="text-lg" />
        </button>
      </Transition>
    </div>

    <!-- input area -->
    <div class="p-6">
      <div class="max-w-3xl mx-auto">
        <!-- Message Queue Indicator -->
        <!-- queue indicator -->
      <div v-if="messageQueue.length > 0" class="max-w-3xl mx-auto px-6 mb-4">
        <div class="flex flex-col gap-2">
          <div 
            v-for="(queuedMsg, idx) in messageQueue" 
            :key="idx"
            class="group relative flex items-center justify-between gap-4 p-3 pr-4 rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 animate-slide-up"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                {{ idx + 1 }}
              </div>
              <input 
                v-model="messageQueue[idx]"
                class="bg-transparent border-none focus:ring-0 text-[13px] text-neutral-600 dark:text-neutral-400 w-full truncate"
              />
            </div>
            <button 
              @click="removeFromQueue(idx)"
              class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all"
            >
              <UIcon name="i-lucide-x" class="text-xs" />
            </button>
          </div>
          <div class="flex items-center justify-between px-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Messages in Queue</span>
            <button 
              @click="messageQueue = []"
              class="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear Queue
            </button>
          </div>
        </div>
      </div>
        </Transition>

        <div 
          class="relative group transition-all duration-300 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 shadow-sm focus-within:shadow-xl focus-within:border-primary-500/50 dark:focus-within:border-primary-400/30 ring-0 focus-within:ring-4 focus-within:ring-primary-500/10"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            rows="1"
            placeholder="Ask me anything..."
            class="w-full resize-none bg-transparent px-5 py-4 pr-14 text-[15px] leading-relaxed placeholder:text-neutral-400 focus:outline-none transition-all"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="absolute right-3 bottom-3 flex items-center gap-2">
            <!-- Stop Button -->
            <Transition name="fade">
              <button
                v-if="isLoading"
                class="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all scale-100 active:scale-95"
                title="Stop generating"
                @click="stopGenerating"
              >
                <UIcon name="i-lucide-square" class="text-sm fill-current" />
              </button>
            </Transition>

            <!-- Send Button -->
            <Transition name="fade">
              <button
                v-if="input.trim()"
                class="flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-lg bg-primary-500 text-white hover:bg-primary-600 scale-100 active:scale-95"
                @click="sendMessage"
              >
                <UIcon name="i-lucide-arrow-up" class="text-xl" />
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
  saved: [id: string];
}>();

const input = ref("");
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const messageQueue = ref<string[]>([]);
const abortController = ref<AbortController | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const showScrollButton = ref(false);

const fontSize = useState("chatFontSize", () => 15);
const showTimestamps = useState("showTimestamps", () => true);

function handleScroll() {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  showScrollButton.value = scrollHeight - scrollTop - clientHeight > 200;
}

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
  if (props.chatId === "__new__") {
    messages.value = [];
    return;
  }
  try {
    const data = await $fetch<{ messages: Message[] }>(`/api/chats/${props.chatId}`);
    messages.value = data.messages.filter((m) => m.role === "user" || m.role === "assistant");
    scrollToBottom();
  } catch {
    // new chat
  }
}

function clearChat() {
  stopGenerating();
  messages.value = [];
  emit("clear");
}

function stopGenerating() {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
    isLoading.value = false;
  }
}

function removeFromQueue(index: number) {
  messageQueue.value.splice(index, 1);
}

async function sendMessage() {
  if (!input.value.trim()) return;

  const content = input.value.trim();
  input.value = "";
  if (inputRef.value) {
    inputRef.value.style.height = "auto";
  }

  if (isLoading.value) {
    messageQueue.value.push(content);
    return;
  }

  await processMessage(content);
}

async function processMessage(userMessage: string) {
  const useSmartLabeling = useState("useSmartLabeling", () => false);
  let currentId = props.chatId;

  // Handle phantom chat creation
  if (currentId === "__new__") {
    const chat = await $fetch<any>("/api/chats", { method: "POST" });
    currentId = chat.id;
    emit("saved", chat.id);
  }

  isLoading.value = true;
  messages.value.push({ role: "user", content: userMessage });
  messages.value.push({ role: "assistant", content: "" });
  const assistantIndex = messages.value.length - 1;
  scrollToBottom();

  abortController.value = new AbortController();

  try {
    const response = await fetch(`/api/chats/${currentId}/messages`, {
      method: "POST",
      signal: abortController.value.signal,
      body: JSON.stringify({ content: userMessage }),
    });

    // ... rest of stream logic ...

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: props.chatId,
        messages: messages.value.slice(0, -1),
      }),
      signal: abortController.value.signal,
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
              const assistantMsg = messages.value[assistantIndex];
              if (parsed.content && assistantMsg) {
                assistantMsg.content += parsed.content;
                scrollToBottom();
              }
            } catch {
              // ignore parse errors
            }
        }
      }
    }
  } catch (e: any) {
    if (e.name === 'AbortError') {
      const assistantMsg = messages.value[assistantIndex];
      if (assistantMsg) {
        assistantMsg.content += " _(Interrupted)_";
      }
    } else {
      const assistantMsg = messages.value[assistantIndex];
      if (assistantMsg) {
        assistantMsg.content = "Something went wrong. Please try again.";
      }
    }
  }

  isLoading.value = false;
  abortController.value = null;

  // Auto-rename if it's the first exchange
  if (messages.value.length === 2) {
    autoRename(userMessage);
  }

  // Process next message in queue if any
  if (messageQueue.value.length > 0) {
    const nextMessage = messageQueue.value.shift();
    if (nextMessage) {
      await processMessage(nextMessage);
    }
  }
}

async function autoRename(prompt: string) {
  const title = prompt.length > 40 ? prompt.substring(0, 37) + "..." : prompt;
  await $fetch(`/api/chats/${props.chatId}`, {
    method: "PATCH",
    body: { title }
  });
  // Parent will reload chats if needed via some event or just let it be
}

async function retryMessage(index: number) {
  if (isLoading.value) return;
  
  // Find the last user message before this assistant message
  let lastUserMessage = "";
  for (let i = index; i >= 0; i--) {
    const msg = messages.value[i];
    if (msg?.role === 'user') {
      lastUserMessage = msg.content;
      break;
    }
  }
  
  if (lastUserMessage) {
    // Remove all messages from this index onwards
    messages.value = messages.value.slice(0, index);
    await processMessage(lastUserMessage);
  }
}

// Keyboard shortcuts
function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    clearChat();
  }
}

const initialPromptState = useState("initialPrompt", () => "");

const promptCards = [
  { icon: "i-lucide-code-2", text: "Help me write code" },
  { icon: "i-lucide-palette", text: "Design something" },
  { icon: "i-lucide-lightbulb", text: "Brainstorm ideas" },
  { icon: "i-lucide-graduation-cap", text: "Explain concepts" },
];

async function sendInitialPrompt(text: string) {
  input.value = text;
  await sendMessage();
}

onMounted(async () => {
  await loadMessages();
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll);
  }
  window.addEventListener('keydown', handleGlobalKeydown);

  // Auto-send if redirected from empty state with a prompt
  if (initialPromptState.value) {
    const prompt = initialPromptState.value;
    initialPromptState.value = "";
    input.value = prompt;
    await sendMessage();
  }
});

onUnmounted(() => {
  stopGenerating();
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('keydown', handleGlobalKeydown);
});
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
