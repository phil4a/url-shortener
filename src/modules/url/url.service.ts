import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UidService } from '@src/services/uid/uid.service';
import { DatabaseService } from '@src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { GetUrlDto } from './dto/get-url.dto';
import { PaginationService } from '@src/services/pagination/pagination.service';

@Injectable()
export class UrlService {
  private host: string;
  constructor(
    private readonly uidService: UidService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly paginationService: PaginationService,
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

  async findAll(dto: GetUrlDto) {
    const { meta, urls } = await this.paginationService.getPagination(dto);
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
