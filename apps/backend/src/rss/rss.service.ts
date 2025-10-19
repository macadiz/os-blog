import { Injectable } from '@nestjs/common';
import { Feed } from 'feed';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SetupService } from '../setup/setup.service';
import { sanitizeHtmlForRss } from '../common/utils/content.util';

@Injectable()
export class RssService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly setupService: SetupService,
  ) {}

  async generateFeed(origin?: string): Promise<string> {
    // Get blog settings for feed metadata
    const settings = await this.setupService.getBlogSettings();
    let baseUrl: string;

    const isProduction = this.configService.get('NODE_ENV') === 'production';
    if (isProduction && origin) {
      // In production, use the request's origin
      baseUrl = origin;
    } else {
      // In development or if no origin available, use the configured URL or default
      baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    }

    // Create feed instance with blog metadata
    const feed = new Feed({
      title: settings?.blogTitle || 'OS Blog',
      description: settings?.blogDescription || 'Latest blog posts',
      id: baseUrl,
      link: baseUrl,
      language: 'en',
      favicon: `${baseUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      updated: new Date(),
      feedLinks: {
        rss2: `${baseUrl}/rss.xml`,
      },
    });

    // Get published posts
    const posts = await this.prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20, // Limit to latest 20 posts
    });

    // Add posts to feed
    posts.forEach((post) => {
      // Use htmlContent if available, otherwise fallback to raw content converted to HTML
      const content = post.htmlContent || post.content;
      // Sanitize HTML content for RSS
      const sanitizedContent = sanitizeHtmlForRss(content);

      feed.addItem({
        title: post.title,
        id: `${baseUrl}/blog/${post.slug}`,
        link: `${baseUrl}/blog/${post.slug}`,
        description: post.excerpt || '',
        content: sanitizedContent,
        author: [
          {
            name: post.author
              ? `${post.author.firstName} ${post.author.lastName}`
              : 'Anonymous',
            email: post.author?.email || '',
          },
        ],
        date: post.publishedAt || post.createdAt,
        category: post.category ? [{ name: post.category.name }] : undefined,
      });
    });

    return feed.rss2();
  }
}
