<template>
  <div class="flex-1 flex flex-col items-center justify-center p-8">
    <div class="max-w-md text-center">
      <div
        class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center"
      >
        <UIcon name="i-lucide-sparkles" class="text-3xl text-primary-500" />
      </div>

      <h1 class="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
        How can I help you today?
      </h1>

      <p class="text-neutral-500 dark:text-neutral-400 mb-8">
        Start a conversation to get answers, brainstorm ideas, or just chat.
      </p>

      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
        @click="$emit('newChat')"
      >
        <UIcon name="i-lucide-plus" />
        Start new chat
      </button>

      <div class="mt-12 grid grid-cols-2 gap-3">
        <button
          v-for="prompt in prompts"
          :key="prompt.text"
          class="p-4 text-left rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all group"
          @click="$emit('newChat', prompt.text)"
        >
          <UIcon
            :name="prompt.icon"
            class="text-lg text-neutral-400 group-hover:text-primary-500 transition-colors mb-2"
          />
          <p class="text-sm text-neutral-600 dark:text-neutral-300">{{ prompt.text }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  newChat: [prompt?: string];
}>();

const prompts = [
  { icon: "i-lucide-code", text: "Help me write some code" },
  { icon: "i-lucide-lightbulb", text: "Brainstorm ideas with me" },
  { icon: "i-lucide-file-text", text: "Summarize a document" },
  { icon: "i-lucide-graduation-cap", text: "Explain a concept" },
];
</script>
