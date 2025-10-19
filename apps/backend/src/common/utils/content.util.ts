import { marked } from 'marked';

/**
 * Configures marked with the same options as the frontend
 */
function configureMarked() {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
}

/**
 * Detects if content is already HTML or if it's markdown
 * Simple heuristic: if it contains common HTML tags, treat as HTML
 */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  const htmlPatterns = [
    /<\/?[a-z][\s\S]*>/i, // HTML tags
    /&[a-z]+;/i, // HTML entities
  ];

  return htmlPatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Converts content to HTML
 * - If content is already HTML, returns it as-is
 * - If content is markdown, converts to HTML using marked
 */
export async function convertToHtml(content: string): Promise<string> {
  if (!content || content.trim() === '') {
    return '';
  }

  if (isHtmlContent(content)) {
    return content;
  }

  configureMarked();

  try {
    const html = await marked(content);
    return html;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return content;
  }
}

/**
 * Sanitizes and processes HTML content for RSS feeds
 * Removes any potential script tags or dangerous elements
 */
export function sanitizeHtmlForRss(html: string): string {
  if (!html) return '';

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove onclick, onload, etc.
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}
