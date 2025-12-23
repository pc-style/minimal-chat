#  Minimal Chat (Apple Intelligence Edition)

A premium, high-performance chat interface inspired by Apple Intelligence. Built with Nuxt 4, Tailwind CSS, and Shiki.

## ✨ Premium Features

- **Modern Apple-Inspired UI**: Beautiful glassmorphism, smooth animations, and curated typography.
- **Smart Message Queuing**: Send multiple prompts in rapid succession; the app handles them sequentially.
- **Abort/Stop Response**: Instantly halt model generation with a dedicated stop button and AbortController integration.
- **Advanced Markdown & Shiki**: High-quality syntax highlighting for code blocks with language indicators and Light/Dark mode support.
- **Inline Chat Renaming**: Rename your conversations directly in the sidebar with a single click.
- **Dynamic Accent Colors**: 6 handcrafted color presets (Emerald, Blue, Violet, Rose, Orange, Cyan).
- **Auto-Naming**: Conversations are automatically renamed based on your first prompt.

## 🚀 Quality of Life (QoL) Improvements

1.  **Sidebar Search**: Instantly filter through your conversation history.
2.  **Compact Sidebar Mode**: Toggle between detailed and compact views for the chat list.
3.  **Adjustable Font Size**: Fine-tune the message text size (12px to 20px) for maximum comfort.
4.  **Message Timestamps**: Optional timestamps for every message in the conversation.
5.  **Scroll-to-Bottom Button**: A floating button that appears when you're caught up in history.
6.  **Message Hover Actions**: Quick actions (Copy, Retry) available on every message.
7.  **Smart Keyboard Shortcuts**:
    - `⌘ + K`: Clear current conversation history.
    - `⌘ + N`: Create a new conversation.
    - `⌘ + Enter`: Send message.
8.  **Pulsing Status Indicators**: Visual feedback when the AI is "Thinking" or when the logo is active.
9.  **Premium Code Blocks**: Featuring "Copy to Clipboard" with immediate visual feedback.
10. **Enhanced Focus States**: Fixed "square ring" issues; focus rings now inherit border-radius for a seamless look.
11. **Responsive Textarea**: Auto-resizing input field that grows with your thoughts.
12. **Markdown LaTeX Support Preview**: Clean rendering for mathematical expressions.
13. **Drag & Drop Visual Support**: Ready for future file attachment integration.
14. **High-Fidelity Typography**: Optimized for subpixel antialiasing and modern font features.
15. **Offline Resiliency**: Better error handling and visual cues when the API is unreachable.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **UI & Icons**: [Nuxt UI](https://ui.nuxt.com/) & [Lucide](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Markdown**: [markdown-it](https://github.com/markdown-it/markdown-it)
- **Syntax Highlighting**: [Shiki](https://shiki.style/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) & [SQLite](https://www.sqlite.org/)

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build
```

## 📜 License

MIT
