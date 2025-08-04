import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name } = createTagDto;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if tag with same name or slug already exists
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingTag) {
      throw new ConflictException(
        existingTag.name === name
          ? `Tag with name "${name}" already exists`
          : `Tag with slug "${slug}" already exists`,
      );
    }

    return this.prisma.tag.create({
      data: {
        name,
        slug,
      },
    });
  }

  async findAll(): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    // Check if tag exists
    await this.findOne(id);

    // Check for conflicts if name or slug is being updated
    if (updateTagDto.name || updateTagDto.slug) {
      const conflicts = await this.prisma.tag.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateTagDto.name ? { name: updateTagDto.name } : {},
                updateTagDto.slug ? { slug: updateTagDto.slug } : {},
              ].filter((condition) => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (conflicts) {
        throw new ConflictException(
          conflicts.name === updateTagDto.name
            ? `Tag with name "${updateTagDto.name}" already exists`
            : `Tag with slug "${updateTagDto.slug}" already exists`,
        );
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Check if tag exists
    await this.findOne(id);

    // Check if tag is being used by any posts
    const tagWithPosts = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    if (tagWithPosts && tagWithPosts._count.postTags > 0) {
      throw new ConflictException(
        `Cannot delete tag "${tagWithPosts.name}" because it is assigned to ${tagWithPosts._count.postTags} post(s)`,
      );
    }

    await this.prisma.tag.delete({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    return tag;
  }
}
