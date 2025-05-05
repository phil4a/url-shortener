import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { UidModule } from '@src/services/uid/uid.module';
import { PaginationModule } from '@src/services/pagination/pagination.module';

@Module({
  imports: [UidModule, PaginationModule],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
