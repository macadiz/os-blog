import { marked } from 'marked';

export class ContentUtil {
  /**
   * Configures marked with the same options as the frontend
   */
  private static configureMarked() {
    marked.setOptions({
      breaks: true, // Convert line breaks to <br>
      gfm: true, // Enable GitHub Flavored Markdown
    });
  }

  /**
   * Detects if content is already HTML or if it's markdown
   * Simple heuristic: if it contains common HTML tags, treat as HTML
   */
  private static isHtmlContent(content: string): boolean {
    // Remove whitespace and check for HTML patterns
    const trimmed = content.trim();

    // Check for common HTML patterns
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
  static async convertToHtml(content: string): Promise<string> {
    if (!content || content.trim() === '') {
      return '';
    }

    // If content is already HTML, return it
    if (this.isHtmlContent(content)) {
      return content;
    }

    // Configure marked and convert markdown to HTML
    this.configureMarked();

    try {
      const html = await marked(content);
      return html;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      // Fallback: return original content if conversion fails
      return content;
    }
  }

  /**
   * Sanitizes and processes HTML content for RSS feeds
   * Removes any potential script tags or dangerous elements
   */
  static sanitizeHtmlForRss(html: string): string {
    if (!html) return '';

    // Basic sanitization - remove script tags and other potentially dangerous elements
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove onclick, onload, etc.
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }
}
