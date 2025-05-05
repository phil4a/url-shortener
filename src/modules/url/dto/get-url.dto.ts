import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetUrlDto {
  @IsOptional()
  filter?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
