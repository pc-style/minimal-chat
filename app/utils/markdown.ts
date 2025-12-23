import MarkdownIt from 'markdown-it'
import { createHighlighter } from 'shiki'

let highlighter: any = null

export async function initHighlighter() {
  if (highlighter) return highlighter
  highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['javascript', 'typescript', 'vue', 'html', 'css', 'python', 'bash', 'cpp', 'json']
  })
  return highlighter
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: (code, lang) => {
    if (!highlighter) return code
    try {
      return highlighter.codeToHtml(code, {
        lang: lang || 'text',
        theme: document.documentElement.classList.contains('dark') ? 'github-dark' : 'github-light'
      })
    } catch (e) {
      return code
    }
  }
})

// Custom rule to wrap code blocks with a header and copy button
const fence = md.renderer.rules.fence!
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (!token) return ''
  
  const lang = token.info.trim() || 'text'
  const rawCode = token.content

  const originalHtml = fence(tokens, idx, options, env, self)

  return `
    <div class="code-block-wrapper group">
      <div class="code-block-header">
        <span class="code-block-lang">${lang}</span>
        <button class="code-copy-btn" data-code="${encodeURIComponent(rawCode)}">
          <span class="copy-icon">Copy</span>
          <span class="check-icon hidden">Copied!</span>
        </button>
      </div>
      <div class="code-block-content">
        ${originalHtml}
      </div>
    </div>
  `
}

export function renderMarkdown(content: string) {
  return md.render(content)
}
