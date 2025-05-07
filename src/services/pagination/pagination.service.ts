import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '@src/database/database.service';
import { GetUrlDto } from '@src/modules/url/dto/get-url.dto';

@Injectable()
export class PaginationService {
  private host: string;
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.host = this.configService.getOrThrow<string>('HOST');
  }
  async getPagination( dto:GetUrlDto ) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const filter = dto.filter || '';
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
      meta,
      urls,
    };
  }
}
