import { Module } from '@nestjs/common';
import { CoreModule } from '@core/core.module';
import { UrlModule } from './modules/url/url.module';
import { UidService } from './services/uid/uid.service';
import { PaginationModule } from './services/pagination/pagination.module';

@Module({
  imports: [CoreModule, UrlModule, PaginationModule],
  controllers: [],
  providers: [UidService],
})
export class AppModule {}
