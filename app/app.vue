<template>
  <UApp>
    <div class="flex h-screen bg-gray-50 dark:bg-gray-950">
      <!-- sidebar -->
      <aside
        class="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm"
      >
        <!-- sidebar header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20"
            >
              <UIcon name="i-lucide-bot" class="text-white text-xl" />
            </div>
            <div>
              <h1 class="font-semibold text-gray-900 dark:text-white">Minimal Chat</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
            </div>
          </div>
          <UButton
            icon="i-lucide-plus"
            label="New Chat"
            color="primary"
            block
            class="shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
            @click="createNewChat"
          />
        </div>

        <!-- chat list -->
        <div class="flex-1 overflow-y-auto p-3">
          <p v-if="chats.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No conversations yet
          </p>
          <TransitionGroup name="chat-list" tag="div" class="space-y-1">
            <div
              v-for="chat in chats"
              :key="chat.id"
              class="group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
              :class="
                chat.id === activeChatId
                  ? 'bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
              "
              @click="selectChat(chat.id)"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                :class="
                  chat.id === activeChatId
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                "
              >
                <UIcon name="i-lucide-message-square" class="text-sm" />
              </div>
              <span
                class="flex-1 truncate text-sm font-medium transition-colors duration-200"
                :class="
                  chat.id === activeChatId
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300'
                "
              >
                {{ chat.title }}
              </span>
              <UButton
                icon="i-lucide-trash-2"
                color="neutral"
                variant="ghost"
                size="xs"
                class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                @click.stop="deleteChat(chat.id)"
              />
            </div>
          </TransitionGroup>
        </div>

        <!-- sidebar footer -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center">
            <UIcon name="i-lucide-sparkles" />
            <span>Powered by AI</span>
          </div>
        </div>
      </aside>

      <!-- main content -->
      <main class="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <Transition name="fade" mode="out-in">
          <ChatView v-if="activeChatId" :key="activeChatId" :chat-id="activeChatId" />
          <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
            <div
              class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6 animate-pulse"
            >
              <UIcon name="i-lucide-message-circle" class="text-4xl" />
            </div>
            <h2 class="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">Welcome to Minimal Chat</h2>
            <p class="text-sm text-center max-w-sm">
              Start a new conversation or select an existing chat from the sidebar
            </p>
            <UButton
              icon="i-lucide-plus"
              label="Start a new chat"
              color="primary"
              variant="soft"
              class="mt-6"
              @click="createNewChat"
            />
          </div>
        </Transition>
      </main>
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

onMounted(loadChats);
</script>

<style>
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.3s ease;
}
.chat-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.chat-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.chat-list-move {
  transition: transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
