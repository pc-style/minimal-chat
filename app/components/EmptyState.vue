<template>
  <div class="flex-1 flex flex-col items-center justify-center p-12 bg-neutral-50/50 dark:bg-transparent">
    <div class="max-w-xl w-full text-center space-y-10">
      <div class="space-y-4">
        <div
          class="w-24 h-24 mx-auto rounded-[2.5rem] bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-2xl shadow-primary-500/40 ring-8 ring-primary-500/10 animate-pulse-slow relative mb-8"
        >
          <div class="absolute inset-0 bg-white/10 rounded-[2.5rem] blur-xl opacity-50" />
          <span class="text-white font-black italic tracking-tighter text-4xl select-none relative z-10">AI</span>
        </div>

        <h1 class="text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
          How can I help you today?
        </h1>

        <p class="text-[15px] text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
          I'm Apple Intelligence. I can help you write, code, brainstorm, and more.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="prompt in creativePrompts"
          :key="prompt.text"
          class="flex flex-col items-center p-8 text-center rounded-[2.5rem] bg-white dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-2xl transition-all duration-500 group scale-100 hover:scale-[1.04] active:scale-[0.98] backdrop-blur-md relative overflow-hidden"
          :class="prompt.hoverClass"
          @click="onPromptClick(prompt.text)"
        >
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br" :class="prompt.bgGradient" />
          
          <div class="w-16 h-16 rounded-[1.5rem] bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner relative z-10">
            <UIcon
              :name="prompt.icon"
              class="text-4xl transition-colors duration-500"
              :class="['text-neutral-400', prompt.iconColor]"
            />
          </div>
          <p class="text-[16px] font-black tracking-tight text-neutral-800 dark:text-neutral-100 relative z-10 transition-colors duration-500 group-hover:text-white">{{ prompt.text }}</p>
          <p class="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 relative z-10 group-hover:text-white/80 uppercase tracking-widest">Launch Action</p>
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
const emit = defineEmits<{
  newChat: [prompt?: string];
}>();

const creativePrompts = [
  { 
    icon: "i-lucide-code-2", 
    text: "Help me write code", 
    hoverClass: "hover:border-blue-500/50", 
    iconColor: "group-hover:text-blue-500", 
    bgGradient: "from-blue-600/90 to-blue-400/90",
    shadowColor: "shadow-blue-500/20"
  },
  { 
    icon: "i-lucide-palette", 
    text: "Design something", 
    hoverClass: "hover:border-rose-500/50", 
    iconColor: "group-hover:text-rose-500", 
    bgGradient: "from-rose-600/90 to-rose-400/90",
    shadowColor: "shadow-rose-500/20"
  },
  { 
    icon: "i-lucide-lightbulb", 
    text: "Brainstorm ideas", 
    hoverClass: "hover:border-amber-500/50", 
    iconColor: "group-hover:text-amber-500", 
    bgGradient: "from-amber-600/90 to-amber-400/90",
    shadowColor: "shadow-amber-500/20"
  },
  { 
    icon: "i-lucide-graduation-cap", 
    text: "Explain concepts", 
    hoverClass: "hover:border-emerald-500/50", 
    iconColor: "group-hover:text-emerald-500", 
    bgGradient: "from-emerald-600/90 to-emerald-400/90",
    shadowColor: "shadow-emerald-500/20"
  },
];

function onPromptClick(text: string) {
  emit('newChat', text);
}
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
