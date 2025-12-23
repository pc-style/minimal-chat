<template>
  <div class="flex-1 flex flex-col items-center justify-center p-12 bg-neutral-50/50 dark:bg-transparent">
    <div class="max-w-xl w-full text-center space-y-10">
      <div class="space-y-4">
        <div
          class="w-20 h-20 mx-auto rounded-[2rem] bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-2xl shadow-primary-500/30 ring-8 ring-primary-500/10 animate-pulse-slow"
        >
          <UIcon name="i-lucide-sparkles" class="text-4xl text-white" />
        </div>

        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          How can I help you today?
        </h1>

        <p class="text-[15px] text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
          I'm Apple Intelligence. I can help you write, code, brainstorm, and more.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="prompt in prompts"
          :key="prompt.text"
          class="flex flex-col items-center p-6 text-center rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50 shadow-sm hover:shadow-xl hover:border-primary-500/50 dark:hover:border-primary-400/30 transition-all group scale-100 hover:scale-[1.02] active:scale-[0.98]"
          @click="$emit('newChat', prompt.text)"
        >
          <div class="w-12 h-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4 group-hover:bg-primary-500/10 transition-colors">
            <UIcon
              :name="prompt.icon"
              class="text-2xl text-neutral-400 group-hover:text-primary-500 transition-colors"
            />
          </div>
          <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{{ prompt.text }}</p>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to start</p>
        </button>
      </div>

      <div class="pt-4">
        <button
          class="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-neutral-500/20 active:scale-95 overflow-hidden"
          @click="$emit('newChat')"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <UIcon name="i-lucide-plus" class="relative z-10" />
          <span class="relative z-10">Start custom chat</span>
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
  { icon: "i-lucide-code", text: "Help me write code" },
  { icon: "i-lucide-palette", text: "Design something" },
  { icon: "i-lucide-lightbulb", text: "Brainstorm ideas" },
  { icon: "i-lucide-graduation-cap", text: "Explain concepts" },
];
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>
