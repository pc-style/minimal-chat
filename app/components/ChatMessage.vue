<template>
  <div class="flex gap-4 group/message" :class="isUser ? 'flex-row-reverse' : ''">
    <!-- avatar -->
    <div
      class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm transition-transform group-hover/message:scale-105"
      :class="[
        isUser ? 'bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800' : 'bg-gradient-to-br from-primary-500 to-primary-600',
        role === 'error' ? 'from-rose-500 to-rose-600 !bg-gradient-to-br' : ''
      ]"
    >
      <UIcon
        :name="role === 'error' ? 'i-lucide-alert-circle' : (isUser ? 'i-lucide-user' : 'i-lucide-sparkles')"
        :class="isUser && role !== 'error' ? 'text-neutral-600 dark:text-neutral-300' : 'text-white'"
        class="text-base"
      />
    </div>

    <!-- content -->
    <div class="flex-1 min-w-0 relative" :class="isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'">
      <div
        class="inline-block max-w-full rounded-2xl px-5 py-3.5 shadow-sm transition-all group/bubble relative"
        :class="[
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 text-neutral-900 dark:text-neutral-100 rounded-tl-none hover:shadow-md',
          role === 'error' ? 'border-rose-500/50 dark:border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : ''
        ]"
        :style="{ fontSize: `${fontSize}px` }"
      >
        <!-- loading state -->
        <div v-if="isLoading && !content" class="flex items-center gap-1.5 py-1">
          <span class="loading-dot" />
          <span class="loading-dot" style="animation-delay: 0.15s" />
          <span class="loading-dot" style="animation-delay: 0.3s" />
        </div>

        <!-- message content -->
        <div
          v-else
          ref="contentRef"
          class="prose prose-sm max-w-none break-words"
          :class="isUser ? 'prose-invert' : 'dark:prose-invert'"
          v-html="htmlContent"
        />

        <!-- Action bar -->
        <div 
          class="absolute -bottom-10 flex gap-1 items-center opacity-0 group-hover/message:opacity-100 transition-opacity p-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm z-10"
          :class="isUser ? 'right-0' : 'left-0'"
        >
          <button 
            class="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-neutral-500" 
            title="Copy message"
            @click="copyMessage"
          >
            <UIcon :name="copiedMsg ? 'i-lucide-check' : 'i-lucide-copy'" class="text-xs" :class="copiedMsg ? 'text-emerald-500' : ''" />
          </button>
          <button 
            v-if="!isUser"
            class="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-neutral-500" 
            title="Retry"
            @click="$emit('retry')"
          >
            <UIcon name="i-lucide-rotate-ccw" class="text-xs" />
          </button>
        </div>
      </div>

      <!-- timestamp -->
      <span v-if="showTimestamp" class="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 px-1">
        {{ timestamp }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initHighlighter, renderMarkdown } from '~/utils/markdown';

const props = defineProps<{
  isUser: boolean;
  content: string;
  role?: "user" | "assistant" | "error";
  isLoading?: boolean;
  fontSize?: number;
  showTimestamp?: boolean;
}>();

defineEmits<{
  retry: [];
}>();

const htmlContent = ref('');
const contentRef = ref<HTMLElement | null>(null);
const copiedMsg = ref(false);
const timestamp = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

async function copyMessage() {
  await navigator.clipboard.writeText(props.content);
  copiedMsg.value = true;
  setTimeout(() => copiedMsg.value = false, 2000);
}

// Update content when props change
watch(() => props.content, async (newVal) => {
  htmlContent.value = renderMarkdown(newVal || '');
}, { immediate: true });

// Also update when dark mode changes for syntax highlighting
const colorMode = useColorMode();
watch(() => colorMode.value, () => {
  htmlContent.value = renderMarkdown(props.content || '');
});

onMounted(async () => {
  await initHighlighter();
  htmlContent.value = renderMarkdown(props.content || '');
});

// Handle copy buttons using event delegation
onMounted(() => {
  const handleCopy = async (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('.code-copy-btn') as HTMLElement;
    if (!btn) return;

    const code = decodeURIComponent(btn.dataset.code || '');
    try {
      await navigator.clipboard.writeText(code);
      
      const copyIcon = btn.querySelector('.copy-icon');
      const checkIcon = btn.querySelector('.check-icon');
      
      copyIcon?.classList.add('hidden');
      checkIcon?.classList.remove('hidden');
      
      setTimeout(() => {
        copyIcon?.classList.remove('hidden');
        checkIcon?.classList.add('hidden');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  document.addEventListener('click', handleCopy);
  onUnmounted(() => document.removeEventListener('click', handleCopy));
});
</script>

<style>
.loading-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.4;
  animation: loadingPulse 1s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* premium code block styling */
.code-block-wrapper {
  margin: 1.25rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.dark .code-block-wrapper {
  background: #0d1117;
  border: 1px solid #30363d;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  color: #64748b;
}

.dark .code-block-header {
  background: #161b22;
  border-bottom: 1px solid #30363d;
  color: #8b949e;
}

.code-block-lang {
  font-weight: 500;
  text-transform: lowercase;
}

.code-copy-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
}

.code-copy-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.dark .code-copy-btn:hover {
  background: #21262d;
  color: #f0f6fc;
}

.code-block-content pre {
  margin: 0 !important;
  padding: 1rem !important;
  background: transparent !important;
  overflow-x: auto;
}

.code-block-content code {
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-size: 0.825rem !important;
  line-height: 1.5 !important;
}

/* prose overrides */
.prose p {
  margin: 0;
}

.prose p + p {
  margin-top: 1rem;
}

.prose :not(pre) > code {
  background: rgba(0, 0, 0, 0.04);
  padding: 0.2rem 0.4rem;
  border-radius: 0.375rem;
  font-size: 0.875em;
  font-weight: 500;
  color: #e11d48;
}

.dark .prose :not(pre) > code {
  background: rgba(255, 255, 255, 0.1);
  color: #fb7185;
}

.prose code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
}

.prose ul,
.prose ol {
  margin: 0.75em 0;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.375em 0;
}

.prose blockquote {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin: 1.25rem 0;
  color: #64748b;
  font-style: italic;
}

.dark .prose blockquote {
  border-left-color: #334155;
  color: #94a3b8;
}
</style>
