import { Module } from '@nestjs/common';
import { CoreModule } from '@core/core.module';
import { UrlModule } from './modules/url/url.module';
import { UidService } from './services/uid/uid.service';

@Module({
  imports: [CoreModule, UrlModule],
  controllers: [],
  providers: [UidService],
})
export class AppModule {}
