// 服务端 Markdown 渲染：与 public/js/article-detail.js 的规则保持一致，
// 保证爬虫拿到的正文和浏览器里看到的一致。

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 去掉导入脚本留下的结构化段落，只保留正文
function cleanExportedContent(content) {
  return String(content || '')
    .replace(/^## 基本信息\n\n[\s\S]*?---\n\n/, '')
    .replace(/^## 文章内容\n\n/, '')
    .replace(/^## 相关链接\n\n[\s\S]*$/, '')
    .replace(/\*\*分类\*\*:.*?\n/, '')
    .replace(/\*\*标签\*\*:.*?\n/, '')
    .replace(/\*\*阅读时间\*\*:.*?\n/, '')
    .replace(/\*\*阅读量\*\*:.*?\n/, '')
    .replace(/\*\*发布日期\*\*:.*?\n/, '')
    .replace(/^- #.*$/gm, '')
    .replace(/^\*本文由博客系统自动导出.*?\*$/m, '')
    .trim();
}

// 行内 Markdown：先转义 HTML，再套用行内样式
function inline(text) {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// 图表附件：![说明](diagram:文件名) 独占一段时，内嵌 public/diagrams 下的整页图表
const DIAGRAM_PATTERN = /^!\[([^\]]*)\]\(diagram:([a-zA-Z0-9_-]+)\)$/;

function renderDiagram(alt, name) {
  return `<figure class="diagram-embed"><iframe src="/diagrams/${name}.html" title="${escapeHtml(alt || '结构示意图')}" loading="lazy"></iframe></figure>`;
}

function isTable(block) {
  const lines = block.split('\n');
  return lines.length >= 2
    && lines[0].trim().startsWith('|')
    && lines[1].trim().includes('-')
    && /^[\s|:-]+$/.test(lines[1].trim());
}

function renderTable(block) {
  const splitRow = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  const lines = block.split('\n');
  const head = splitRow(lines[0]);
  const rows = lines.slice(2).map(splitRow);
  const headHtml = `<thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead>`;
  const bodyHtml = `<tbody>${rows.map(r => `<tr>${head.map((_, i) => `<td>${inline(r[i] || '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="table-scroll"><table>${headHtml}${bodyHtml}</table></div>`;
}

function renderMarkdown(rawContent) {
  const content = cleanExportedContent(rawContent);

  // 先把代码块摘出来，避免其中的空行被误当作分段
  const codeBlocks = [];
  const source = content.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    codeBlocks.push(`<pre><code${cls}>${escapeHtml(code.replace(/\r?\n$/, ''))}</code></pre>`);
    return `@@CODE${codeBlocks.length - 1}@@`;
  });

  return source
    .split(/\n{2,}/)
    .map(block => {
      const para = block.trim();
      if (!para) return '';

      const placeholder = para.match(/^@@CODE(\d+)@@$/);
      if (placeholder) return codeBlocks[Number(placeholder[1])];

      const diagram = para.match(DIAGRAM_PATTERN);
      if (diagram) return renderDiagram(diagram[1], diagram[2]);

      if (para.startsWith('### ')) return `<h3>${inline(para.slice(4))}</h3>`;
      if (para.startsWith('## ')) return `<h2>${inline(para.slice(3))}</h2>`;
      if (para.startsWith('# ')) return `<h1>${inline(para.slice(2))}</h1>`;

      if (para.startsWith('> ')) {
        const quoted = para.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n');
        return `<blockquote>${inline(quoted)}</blockquote>`;
      }
      if (/^[-*] /.test(para)) {
        const items = para.split('\n').map(l => `<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      if (/^\d+\. /.test(para)) {
        const items = para.split('\n').map(l => `<li>${inline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('');
        return `<ol>${items}</ol>`;
      }
      if (isTable(para)) return renderTable(para);

      return `<p>${inline(para)}</p>`;
    })
    .join('');
}

module.exports = { escapeHtml, cleanExportedContent, renderMarkdown };
