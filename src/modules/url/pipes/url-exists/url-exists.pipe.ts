import {  Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { UrlService } from '../../url.service';

@Injectable()
export class UrlExistsPipe implements PipeTransform {
  constructor(
private readonly urlService: UrlService,
  ) {}
  async transform(uid: any) {
    const redirectUrl = this.urlService.findOne(uid);
  
    if (!redirectUrl) throw new NotFoundException('Url not found');
    return redirectUrl;
  }

}
