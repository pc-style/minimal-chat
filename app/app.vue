<template>
  <UApp>
    <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950 font-sans selection:bg-primary-500/30">
      <!-- sidebar -->
      <aside class="w-72 flex flex-col border-r border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl">
        <div class="h-20 flex items-center px-6 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20 ring-4 ring-primary-500/10 transition-all duration-500">
              <span class="text-white font-black italic tracking-tighter text-lg select-none">AI</span>
            </div>
            <div>
              <p class="font-bold text-[14px] leading-none text-neutral-900 dark:text-white">Minimal Chat</p>
              <p class="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-1">Intelligence</p>
            </div>
          </div>
        </div>

        <!-- Sidebar Search -->
        <div class="px-4 pt-4">
          <div class="relative group">
            <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm group-focus-within:text-primary-500 transition-colors" />
            <input 
              v-model="searchQuery" 
              placeholder="Search chats..." 
              class="w-full bg-neutral-100/50 dark:bg-neutral-800/50 border border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-neutral-800 rounded-xl py-2 pl-9 pr-3 text-[13px] outline-none transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        <!-- new chat button -->
        <div class="p-4">
          <button
            class="w-full flex items-center justify-between gap-2 px-4 py-3 text-[13px] font-semibold rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-400/30 transition-all group"
            @click="createNewChat"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-plus" class="text-lg text-primary-500" />
              <span class="text-neutral-700 dark:text-neutral-200">New Conversation</span>
            </div>
            <kbd class="hidden sm:block px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-[10px] text-neutral-400 font-mono">⌘N</kbd>
          </button>
        </div>

        <!-- chat list -->
        <div class="flex-1 overflow-y-auto px-4 space-y-4 pt-2">
          <div>
            <div class="flex items-center justify-between px-2 mb-3">
              <h3 class="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Recent Chats</h3>
              <div class="flex gap-1">
                <button @click="isCompact = !isCompact" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" :title="isCompact ? 'Normal view' : 'Compact view'">
                  <UIcon :name="isCompact ? 'i-lucide-layout-list' : 'i-lucide-list'" class="text-sm" />
                </button>
              </div>
            </div>
            <TransitionGroup name="list" tag="div" class="space-y-1">
              <div
                v-for="chat in filteredChats"
                :key="chat.id"
                class="w-full group flex items-center gap-3 rounded-xl transition-all text-left cursor-pointer border border-transparent"
                :class="[
                  chat.id === activeChatId
                    ? 'bg-white dark:bg-neutral-800 border-neutral-200/60 dark:border-neutral-700/60 shadow-sm text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40',
                  isCompact ? 'px-2.5 py-1.5' : 'px-3 py-2.5'
                ]"
                @click="editingChatId !== chat.id && selectChat(chat.id)"
              >
                <div 
                  class="rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="[
                    chat.id === activeChatId ? 'bg-primary-500/10 text-primary-500' : 'bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-white dark:group-hover:bg-neutral-700',
                    isCompact ? 'w-6 h-6' : 'w-8 h-8'
                  ]"
                >
                  <UIcon :name="chat.id === activeChatId ? 'i-lucide-message-circle' : 'i-lucide-message-square'" :class="isCompact ? 'text-[13px]' : 'text-base'" />
                </div>
                
                <div class="flex-1 min-w-0">
                  <input
                    v-if="editingChatId === chat.id"
                    v-model="editingTitle"
                    class="rename-input w-full bg-transparent border-none p-0 focus:ring-0 font-medium text-neutral-900 dark:text-white"
                    @keydown.enter="saveRename(chat.id)"
                    @keydown.esc="cancelRenaming"
                    @blur="saveRename(chat.id)"
                  />
                  <span v-else class="block truncate font-medium">{{ chat.title || 'New Chat' }}</span>
                </div>

                <div v-if="editingChatId !== chat.id" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    title="Rename"
                    @click.stop="startRenaming(chat)"
                  >
                    <UIcon name="i-lucide-pencil" class="text-xs" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all text-neutral-400"
                    title="Delete"
                    @click.stop="deleteChat(chat.id)"
                  >
                    <UIcon name="i-lucide-trash-2" class="text-xs" />
                  </button>
                </div>
              </div>
            </TransitionGroup>

            <div
              v-if="chats.length === 0"
              class="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3"
            >
              <div class="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center">
                <UIcon name="i-lucide-ghost" class="text-2xl text-neutral-300 dark:text-neutral-600" />
              </div>
              <p class="text-xs text-neutral-400 dark:text-neutral-600 font-medium">No conversations yet</p>
            </div>
          </div>
        </div>

        <!-- settings/profile bar -->
        <div class="p-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all group"
            @click="showSettings = true"
          >
            <div class="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
              <UIcon name="i-lucide-settings" class="text-base" />
            </div>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <!-- main content -->
      <main class="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 shadow-2xl">
        <ChatView
          v-if="activeChatId"
          :key="activeChatId"
          :chat-id="activeChatId"
          @clear="clearCurrentChat"
          @saved="onChatSaved"
        />
      </main>

      <!-- modals -->
      <SettingsModal v-model="showSettings" />
    </div>
  </UApp>
</template>

<script setup lang="ts">
interface ChatData {
  id: string;
  title: string;
}

const chats = ref<ChatData[]>([]);
const activeChatId = ref<string | null>("__new__");
const showSettings = ref(false);
const editingChatId = ref<string | null>(null);
const editingTitle = ref("");
const searchQuery = ref("");
const isCompact = useState("sidebarCompact", () => false);
const fontSize = useState("chatFontSize", () => 15);
const showTimestamps = useState("showTimestamps", () => true);
const useSmartLabeling = useState("useSmartLabeling", () => false);
const selectedAccent = useState("accentColor", () => "green");

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value;
  return chats.value.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Persistence
onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem("minimal-chat-prefs");
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        if (prefs.accentColor) selectedAccent.value = prefs.accentColor;
        if (typeof prefs.sidebarCompact === 'boolean') isCompact.value = prefs.sidebarCompact;
        if (typeof prefs.chatFontSize === 'number') fontSize.value = prefs.chatFontSize;
        if (typeof prefs.showTimestamps === 'boolean') showTimestamps.value = prefs.showTimestamps;
        if (typeof prefs.useSmartLabeling === 'boolean') useSmartLabeling.value = prefs.useSmartLabeling;
      } catch (e) {
        console.error("Failed to load prefs", e);
      }
    }
  }
});

watch([selectedAccent, isCompact, fontSize, showTimestamps, useSmartLabeling], () => {
  console.log("Prefs changed:", { accent: selectedAccent.value });
  if (process.client) {
    localStorage.setItem("minimal-chat-prefs", JSON.stringify({
      accentColor: selectedAccent.value,
      sidebarCompact: isCompact.value,
      chatFontSize: fontSize.value,
      showTimestamps: showTimestamps.value,
      useSmartLabeling: useSmartLabeling.value
    }));
  }
}, { deep: true, immediate: true });

const accentMap: Record<string, string> = {
  green: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  orange: "#f59e0b",
  cyan: "#06b6d4"
};

const primaryColor = computed(() => accentMap[selectedAccent.value] || accentMap.green);

useHead({
  style: [
    {
      id: "dynamic-theme",
      innerHTML: computed(() => {
        const color = primaryColor.value;
        return `
          :root {
            --ui-color-primary-50: ${color}11;
            --ui-color-primary-100: ${color}22;
            --ui-color-primary-200: ${color}44;
            --ui-color-primary-300: ${color}77;
            --ui-color-primary-400: ${color}aa;
            --ui-color-primary-500: ${color};
            --ui-color-primary-600: ${color}dd;
            --ui-color-primary-700: ${color}ee;
            
            --color-primary-400: ${color}aa;
            --color-primary-500: ${color};
            --color-primary-600: ${color}dd;
          }
        `;
      })
    }
  ]
});

async function loadChats() {
  chats.value = await $fetch<ChatData[]>("/api/chats");
}

async function createNewChat() {
  activeChatId.value = "__new__";
}

function onChatSaved(newId: string) {
  activeChatId.value = newId;
  loadChats();
}

function selectChat(chatId: string) {
  activeChatId.value = chatId;
}

async function startRenaming(chat: ChatData) {
  editingChatId.value = chat.id;
  editingTitle.value = chat.title || "New Chat";
  await nextTick();
  const input = document.querySelector('.rename-input') as HTMLInputElement;
  input?.focus();
}

async function cancelRenaming() {
  editingChatId.value = null;
  editingTitle.value = "";
}

async function saveRename(chatId: string) {
  if (!editingTitle.value.trim()) return cancelRenaming();
  
  await $fetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    body: { title: editingTitle.value.trim() }
  });
  
  editingChatId.value = null;
  await loadChats();
}

async function deleteChat(chatId: string) {
  await $fetch(`/api/chats/${chatId}`, { method: "DELETE" });
  if (activeChatId.value === chatId) {
    activeChatId.value = null;
  }
  await loadChats();
}

async function clearCurrentChat() {
  if (!activeChatId.value) return;
  await $fetch(`/api/chats/${activeChatId.value}/messages`, { method: "DELETE" });
}

// Keyboard shortcuts
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault()
      createNewChat()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
})

onMounted(loadChats);
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}
.list-move {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

</style>
