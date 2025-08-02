import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tags')
export class TagsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
