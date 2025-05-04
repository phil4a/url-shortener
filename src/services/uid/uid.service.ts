import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class UidService {
  generate(length?: number): string {
    return nanoid(length);
  }
}
