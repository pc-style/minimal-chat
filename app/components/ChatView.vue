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
          title="Clear Conversation"
          @click="clearChat"
        />
      </div>
    </header>

    <!-- messages container -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div class="max-w-3xl mx-auto py-10 px-6">
        <!-- empty state for this chat -->
        <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-12 text-center animate-slide-up">
          <div
            class="w-20 h-20 mx-auto rounded-[2rem] bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-2xl shadow-primary-500/40 ring-8 ring-primary-500/10 mb-8 relative"
          >
            <div class="absolute inset-0 bg-white/10 rounded-[2rem] blur-xl opacity-50" />
            <span class="text-white font-black italic tracking-tighter text-3xl select-none relative z-10 uppercase">AI</span>
          </div>

          <h3 class="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight mb-3">
            What can we create today?
          </h3>
          <p class="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-10 font-medium text-[14px]">
            Choose a creative prompt or start typing your own idea below.
          </p>

          <div class="grid grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
            <button
              v-for="card in creativePrompts"
              :key="card.text"
              class="flex flex-col items-center p-6 text-center rounded-[2rem] bg-white dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-2xl transition-all duration-500 group scale-100 hover:scale-[1.03] active:scale-[0.98] backdrop-blur-md relative overflow-hidden"
              @click="sendInitialPrompt(card.text)"
            >
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br" :class="card.bgGradient" />
              
              <div class="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner relative z-10">
                <UIcon
                  :name="card.icon"
                  class="text-2xl transition-colors duration-500"
                  :class="['text-neutral-400', card.iconColor]"
                />
              </div>
              <p class="text-[14px] font-bold tracking-tight text-neutral-800 dark:text-neutral-100 relative z-10 transition-colors duration-500 group-hover:text-white">{{ card.text }}</p>
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
              :role="msg.role"
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
        <!-- Editable Queue -->
        <div v-if="messageQueue.length > 0" class="mb-4 space-y-2 animate-slide-up">
          <div class="flex items-center justify-between px-2 mb-1">
            <span class="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Scheduled Actions</span>
            <button @click="messageQueue = []" class="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-tight">Clear All</button>
          </div>
          <div 
            v-for="(queuedMsg, idx) in messageQueue" 
            :key="idx"
            class="group relative flex items-center justify-between gap-4 p-3 pr-4 rounded-xl bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 transition-all"
          >
            <div class="flex items-center gap-3 overflow-hidden flex-1">
              <div class="flex-shrink-0 w-6 h-6 rounded-lg bg-primary-500/10 flex items-center justify-center text-[10px] font-black text-primary-600 dark:text-primary-400">
                {{ idx + 1 }}
              </div>
              <input 
                v-model="messageQueue[idx]"
                class="bg-transparent border-none focus:ring-0 text-[13px] text-neutral-600 dark:text-neutral-400 w-full truncate focus:text-neutral-900 dark:focus:text-white"
                placeholder="Edit message..."
              />
            </div>
            <button @click="removeFromQueue(idx)" class="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all">
              <UIcon name="i-lucide-trash-2" class="text-xs" />
            </button>
          </div>
        </div>

        <!-- Input Box -->
        <div 
          class="relative group transition-all duration-300 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 shadow-sm focus-within:shadow-2xl focus-within:border-primary-500/50 dark:focus-within:border-primary-400/30 ring-0 focus-within:ring-4 focus-within:ring-primary-500/10"
        >
          <textarea
            ref="inputRef"
            v-model="input"
            rows="1"
            placeholder="Ask me anything..."
            class="w-full resize-none bg-transparent px-6 py-5 pr-14 text-[15px] leading-relaxed placeholder:text-neutral-400 focus:outline-none transition-all font-medium"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="absolute right-3 bottom-3 flex items-center gap-2">
            <Transition name="fade">
              <button
                v-if="isLoading"
                class="flex items-center justify-center w-11 h-11 rounded-2xl bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-all scale-100 active:scale-95"
                @click="stopGenerating"
              >
                <UIcon name="i-lucide-square" class="text-base fill-current" />
              </button>
            </Transition>

            <Transition name="fade">
              <button
                v-if="input.trim() || isLoading"
                :disabled="!input.trim() && !isLoading"
                class="flex items-center justify-center w-11 h-11 rounded-2xl transition-all shadow-lg bg-primary-500 text-white hover:bg-primary-600 scale-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="sendMessage"
              >
                <UIcon name="i-lucide-arrow-up" class="text-2xl" />
              </button>
            </Transition>
          </div>
        </div>
        <p class="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-4 tracking-wide flex items-center justify-center gap-2 font-medium">
          <span>AI can make mistakes.</span>
          <span class="opacity-30">•</span>
          <span><kbd class="font-sans opacity-60">⌘ + Enter</kbd> to send</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: "user" | "assistant" | "error";
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
const useSmartLabeling = useState("useSmartLabeling", () => false);

const creativePrompts = [
  { icon: "i-lucide-scroll-text", text: "Write a futuristic poem about robot love", iconColor: "text-blue-500", bgGradient: "from-blue-600/10 to-blue-400/10" },
  { icon: "i-lucide-party-popper", text: "Plan a mystery-themed dinner party", iconColor: "text-rose-500", bgGradient: "from-rose-600/10 to-rose-400/10" },
  { icon: "i-lucide-help-circle", text: "Explain coding using pizza metaphors", iconColor: "text-amber-500", bgGradient: "from-amber-600/10 to-amber-400/10" },
  { icon: "i-lucide-clapperboard", text: "Pitch a sci-fi movie about time travel", iconColor: "text-emerald-500", bgGradient: "from-emerald-600/10 to-emerald-400/10" },
];

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
  } catch (e) {
    console.error("Failed to load messages", e);
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
  }
}

function removeFromQueue(index: number) {
  messageQueue.value.splice(index, 1);
}

function sendInitialPrompt(text: string) {
  input.value = text;
  sendMessage();
}

async function sendMessage() {
  if (!input.value.trim() && !isLoading.value) return;

  const content = input.value.trim();
  if (content) {
    input.value = "";
    if (inputRef.value) inputRef.value.style.height = "auto";

    if (isLoading.value) {
      messageQueue.value.push(content);
      return;
    }
    await processMessage(content);
  }
}

async function processMessage(userMessage: string) {
  let currentId = props.chatId;

  // 1. If it's a new chat, create it first
  if (currentId === "__new__") {
    try {
      const chat = await $fetch<any>("/api/chats", { method: "POST" });
      currentId = chat.id;
      // We don't emit yet, we keep using the local currentId to avoid re-keying the component mid-stream
    } catch (e) {
      messages.value.push({ role: "assistant", content: "❌ [System] Failed to initialize conversation database." });
      return;
    }
  }

  isLoading.value = true;
  messages.value.push({ role: "user", content: userMessage });
  messages.value.push({ role: "assistant", content: "" });
  const assistantIndex = messages.value.length - 1;
  scrollToBottom();

  abortController.value = new AbortController();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: currentId,
        messages: messages.value.slice(0, -1),
      }),
      signal: abortController.value.signal,
    });

    if (!response.ok) {
        throw new Error(`Server returned ${response.status}: AI service unavailable.`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Connection failed: could not establish stream.");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned || !cleaned.startsWith("data: ")) continue;
        const data = cleaned.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.content || ""; // Backend uses { content } not delta in our simple mock
          if (messages.value[assistantIndex] && messages.value[assistantIndex].role === 'assistant') {
            messages.value[assistantIndex].content += delta;
            scrollToBottom();
          }
        } catch (e) {}
      }
    }

    // Naming logic
    if (messages.value.length === 2) {
      if (useSmartLabeling.value) {
        await smartRename(userMessage, messages.value[assistantIndex].content, currentId);
      } else {
        await autoRename(userMessage, currentId);
      }
      // Only emit saved (to update sidebar and url) AFTER naming is attempted
      emit("saved", currentId);
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      if (messages.value[assistantIndex]) {
        messages.value[assistantIndex].content += "\n\n*Generation interrupted.*";
      }
    } else {
      if (messages.value[assistantIndex]) {
        messages.value[assistantIndex].content = "⚠️ **An error occurred:** " + (err.message || "Unknown error");
      } else {
        messages.value.push({ role: "error", content: "⚠️ **An error occurred:** " + (err.message || "Unknown error") });
      }
    }
  } finally {
    isLoading.value = false;
    abortController.value = null;

    if (messageQueue.value.length > 0) {
      const nextMessage = messageQueue.value.shift();
      if (nextMessage) await processMessage(nextMessage);
    }
  }
}

async function autoRename(prompt: string, id: string) {
  const title = prompt.length > 30 ? prompt.substring(0, 27) + "..." : prompt;
  await $fetch(`/api/chats/${id}`, { method: "PATCH", body: { title } });
}

async function smartRename(prompt: string, response: string, id: string) {
  try {
    // Simplified smart naming
    await autoRename(prompt, id); 
  } catch (e) {
    await autoRename(prompt, id);
  }
}

async function retryMessage(index: number) {
  if (isLoading.value) return;
  let lastUserMsg = "";
  for (let i = index; i >= 0; i--) {
    if (messages.value[i]?.role === 'user') {
      lastUserMsg = messages.value[i].content;
      messages.value = messages.value.slice(0, i);
      break;
    }
  }
  if (lastUserMsg) await processMessage(lastUserMsg);
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    clearChat();
  }
}

onMounted(async () => {
  await loadMessages();
  if (messagesContainer.value) messagesContainer.value.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleGlobalKeydown);
  
  const initialPrompt = useState("initialPrompt", () => "");
  if (initialPrompt.value) {
    input.value = initialPrompt.value;
    initialPrompt.value = "";
    sendMessage();
  }
});

onUnmounted(() => {
  stopGenerating();
  if (messagesContainer.value) messagesContainer.value.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style>
.message-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.message-enter-from { opacity: 0; transform: translateY(20px) scale(0.98); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.95); }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.dark ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
</style>
