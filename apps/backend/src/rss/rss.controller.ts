import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { RssService } from './rss.service';

@Controller()
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('feed.xml')
  async getRssFeed(@Res() res: Response) {
    const origin = res.req.headers.origin || res.req.headers.host;
    const feed = await this.rssService.generateFeed(origin);
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed);
  }
}
