<template>
  <UApp>
    <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <!-- sidebar -->
      <aside class="w-64 flex flex-col border-r border-neutral-200 dark:border-neutral-800">
        <!-- logo -->
        <div class="h-14 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
              <UIcon name="i-lucide-zap" class="text-white text-xs" />
            </div>
            <span class="font-semibold text-sm">minimal chat</span>
          </div>
        </div>

        <!-- new chat button -->
        <div class="p-3">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            @click="createNewChat"
          >
            <UIcon name="i-lucide-plus" class="text-base" />
            <span>New chat</span>
          </button>
        </div>

        <!-- chat list -->
        <div class="flex-1 overflow-y-auto px-3">
          <TransitionGroup name="list" tag="div" class="space-y-1">
            <button
              v-for="chat in chats"
              :key="chat.id"
              class="w-full group flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all text-left"
              :class="
                chat.id === activeChatId
                  ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              "
              @click="selectChat(chat.id)"
            >
              <UIcon name="i-lucide-message-square" class="text-base flex-shrink-0 opacity-50" />
              <span class="flex-1 truncate">{{ chat.title }}</span>
              <button
                class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all"
                @click.stop="deleteChat(chat.id)"
              >
                <UIcon name="i-lucide-x" class="text-xs" />
              </button>
            </button>
          </TransitionGroup>

          <p
            v-if="chats.length === 0"
            class="text-xs text-neutral-400 dark:text-neutral-600 text-center py-8"
          >
            No conversations yet
          </p>
        </div>

        <!-- bottom bar -->
        <div class="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
            @click="showSettings = true"
          >
            <UIcon name="i-lucide-settings" class="text-base" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <!-- main -->
      <main class="flex-1 flex flex-col bg-white dark:bg-neutral-900">
        <ChatView
          v-if="activeChatId"
          :key="activeChatId"
          :chat-id="activeChatId"
          @clear="clearCurrentChat"
        />
        <EmptyState v-else @new-chat="createNewChat" />
      </main>

      <!-- settings modal -->
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
const activeChatId = ref<string | null>(null);
const showSettings = ref(false);

async function loadChats() {
  chats.value = await $fetch<ChatData[]>("/api/chats");
}

async function createNewChat() {
  const chat = await $fetch<ChatData>("/api/chats", { method: "POST" });
  activeChatId.value = chat.id;
  await loadChats();
}

function selectChat(chatId: string) {
  activeChatId.value = chatId;
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

onMounted(loadChats);
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
.list-move {
  transition: transform 0.2s ease;
}
</style>
