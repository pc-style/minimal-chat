# Apple Minimal Chat

A clean chat interface that feels right at home on your Mac. Built with Nuxt 4, Tailwind CSS, and Shiki.

## Features

It's got all the good stuff:

- **Apple Style UI**: Looks just like the apps you use every day with glass effects and smooth animations.
- **Smart Queue**: Send a bunch of messages at once and let it handle them one by one.
- **Stop Button**: Stop the AI if it starts rambling.
- **Code Highlighting**: Code blocks look great in both light and dark mode.
- **Renaming**: Click to rename chats in the sidebar.
- **Colors**: Pick from 6 different accent colors to match your vibe.
- **Auto Titles**: It names your chats based on what you talk about.

## Nice to Haves

1.  **Search**: Find old conversations quickly.
2.  **Compact Mode**: Switch to a smaller sidebar if you want more space.
3.  **Font Size**: Make the text bigger or smaller.
4.  **Timestamps**: See when messages were sent.
5.  **Scroll Button**: Jump back to the latest message.
6.  **Copy**: Easily copy prompts or responses.
7.  **Shortcuts**:
    - `Cmd + K`: Clear chat
    - `Cmd + N`: New chat
    - `Cmd + Enter`: Send message
8.  **Status**: See when it's thinking.
9.  **Copy Code**: One click to copy code snippets.
10. **Focus Rings**: Everything looks polished.
11. **Auto Resize**: The input box grows as you type.
12. **Math Support**: Renders math equations nicely.
13. **Drag & Drop**: Ready for files when you need it.
14. **Typography**: Text looks crisp on high res screens.
15. **Offline Config**: Handles it gracefully if the internet drops.

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **UI**: [Nuxt UI](https://ui.nuxt.com/) & [Lucide](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Markdown**: [markdown-it](https://github.com/markdown-it/markdown-it)
- **Highlighter**: [Shiki](https://shiki.style/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) & [SQLite](https://www.sqlite.org/)

## Getting Started

```bash
# Install stuff
bun install

# Start it up
bun dev

# Build it
bun run build
```

**Debugging**

If you run into issues, you can enable debug logs by setting `DEBUG=true` in your `.env` file. Check out `.env.example` to see how it's done.

## License

MIT
