import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UidService } from '@src/services/uid/uid.service';
import { DatabaseService } from '@src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { GetUrlDto } from './dto/get-url.dto';

@Injectable()
export class UrlService {
  private host: string;
  constructor(
    private readonly uidService: UidService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.host = this.configService.getOrThrow<string>('HOST');
  }

  async create(createUrlDto: CreateUrlDto) {
    const randomID = this.uidService.generate(5);
    const url = await this.databaseService.url.create({
      data: {
        ...createUrlDto,
        url: `${this.host}/${randomID}`,
      },
    });
    return url;
  }

  async findAll({ filter, page = 1, limit = 10 }: GetUrlDto) {
    const whereClause = filter
      ? {
          OR: [
            {
              title: {
                contains: filter,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: filter,
                mode: 'insensitive' as const,
              },
            },
            {
              url: {
                contains: filter,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};
    const skip = (page - 1) * limit;

    const urls = await this.databaseService.url.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
    });

    const totalCount = await this.databaseService.url.count({
      where: whereClause,
    });

    let baseUrl = `${this.host}/url?limit=${limit}`;
    if (filter) {
      baseUrl += `&filter=${encodeURIComponent(filter)}`;
    }

    const totalPages = Math.ceil(totalCount / limit);
    const nextPage = page < totalPages ? `${baseUrl}&page=${page + 1}` : null;
    const prevPage = page > 1 ? `${baseUrl}&page=${page - 1}` : null;

    const meta = {
      totalCount,
      currentPage: page,
      perPage: limit,
      totalPages,
      nextPage,
      prevPage,
    };

    return {
      data: urls,
      meta,
    };
  }

  async findOne(uid: string) {
    return await this.databaseService.url.findUnique({
      where: { url: `${this.host}/${uid}` },
    });
  }

  async update(id: number, updateUrlDto: UpdateUrlDto) {
    return await this.databaseService.url.update({
      where: { id },
      data: updateUrlDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.url.delete({
      where: { id },
    });
  }

  async incrementClicks(id: number) {
    return await this.databaseService.url.update({
      where: {
        id,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }
}
