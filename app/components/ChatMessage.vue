<template>
  <div class="flex gap-3 message-appear" :class="isUser ? 'flex-row-reverse' : ''">
    <!-- avatar -->
    <div
      class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md"
      :class="
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
          : 'bg-gradient-to-br from-primary-500 to-primary-600'
      "
    >
      <UIcon
        :name="isUser ? 'i-lucide-user' : 'i-lucide-sparkles'"
        class="text-white text-sm"
      />
    </div>

    <!-- message bubble -->
    <div
      class="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm"
      :class="
        isUser
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
      "
    >
      <div
        v-if="isLoading && !content"
        class="flex items-center gap-1 py-1"
      >
        <span class="typing-dot" />
        <span class="typing-dot animation-delay-200" />
        <span class="typing-dot animation-delay-400" />
      </div>
      <div
        v-else
        class="message-content prose prose-sm dark:prose-invert max-w-none"
        :class="isUser ? 'prose-invert' : ''"
        v-html="convertToHtml(content)"
      />
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
});

function convertToHtml(text: string) {
  return converter.makeHtml(text);
}
</script>

<style>
.message-appear {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: currentColor;
  border-radius: 50%;
  opacity: 0.6;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.message-content p {
  margin: 0;
}

.message-content p + p {
  margin-top: 0.75rem;
}

.message-content pre {
  background: rgba(0, 0, 0, 0.15);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.message-content :not(pre) > code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.message-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}

.message-content ul,
.message-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-content li {
  margin: 0.25rem 0;
}

.message-content blockquote {
  border-left: 3px solid currentColor;
  opacity: 0.8;
  padding-left: 1rem;
  margin: 0.75rem 0;
}

.message-content a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.message-content table {
  border-collapse: collapse;
  margin: 0.75rem 0;
  width: 100%;
}

.message-content th,
.message-content td {
  border: 1px solid currentColor;
  opacity: 0.3;
  padding: 0.5rem;
  text-align: left;
}

.message-content th {
  font-weight: 600;
}
</style>
