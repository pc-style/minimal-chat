<template>
  <div class="flex gap-4" :class="isUser ? 'flex-row-reverse' : ''">
    <!-- avatar -->
    <div
      class="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
      :class="isUser ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-primary-500'"
    >
      <UIcon
        :name="isUser ? 'i-lucide-user' : 'i-lucide-sparkles'"
        :class="isUser ? 'text-neutral-600 dark:text-neutral-300' : 'text-white'"
        class="text-sm"
      />
    </div>

    <!-- content -->
    <div class="flex-1 min-w-0" :class="isUser ? 'flex justify-end' : ''">
      <div
        class="inline-block max-w-full rounded-2xl px-4 py-3"
        :class="
          isUser
            ? 'bg-primary-500 text-white rounded-tr-sm'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-sm'
        "
      >
        <!-- loading state -->
        <div v-if="isLoading && !content" class="flex items-center gap-1.5 py-0.5">
          <span class="loading-dot" />
          <span class="loading-dot" style="animation-delay: 0.15s" />
          <span class="loading-dot" style="animation-delay: 0.3s" />
        </div>

        <!-- message content -->
        <div
          v-else
          class="prose prose-sm max-w-none break-words"
          :class="isUser ? 'prose-invert' : 'dark:prose-invert'"
          v-html="renderContent(content)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import showdown from "showdown";

defineProps<{
  isUser: boolean;
  content: string;
  isLoading?: boolean;
}>();

const converter = new showdown.Converter({
  tables: true,
  ghCodeBlocks: true,
  tasklists: true,
  strikethrough: true,
  simpleLineBreaks: true,
});

function renderContent(text: string) {
  if (!text) return "";
  return converter.makeHtml(text);
}
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

/* prose overrides */
.prose p {
  margin: 0;
}

.prose p + p {
  margin-top: 0.75em;
}

.prose pre {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 0.5rem;
  padding: 0.875rem;
  margin: 0.75em 0;
  overflow-x: auto;
}

.dark .prose pre {
  background: rgba(0, 0, 0, 0.3);
}

.prose :not(pre) > code {
  background: rgba(0, 0, 0, 0.06);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-weight: 500;
}

.dark .prose :not(pre) > code {
  background: rgba(255, 255, 255, 0.1);
}

.prose code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
}

.prose ul,
.prose ol {
  margin: 0.5em 0;
  padding-left: 1.25em;
}

.prose li {
  margin: 0.25em 0;
}

.prose blockquote {
  border-left: 2px solid currentColor;
  opacity: 0.8;
  padding-left: 1em;
  margin: 0.75em 0;
  font-style: italic;
}

.prose a {
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.9;
}

.prose a:hover {
  opacity: 1;
}

.prose hr {
  border-color: currentColor;
  opacity: 0.2;
  margin: 1em 0;
}

.prose table {
  border-collapse: collapse;
  margin: 0.75em 0;
  font-size: 0.875em;
}

.prose th,
.prose td {
  border: 1px solid currentColor;
  border-color: rgba(128, 128, 128, 0.3);
  padding: 0.5em 0.75em;
}

.prose th {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.04);
}

.dark .prose th {
  background: rgba(255, 255, 255, 0.04);
}
</style>
