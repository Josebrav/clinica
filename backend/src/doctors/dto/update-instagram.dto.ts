import { IsOptional, IsString } from 'class-validator';

export class UpdateInstagramDto {
  @IsOptional()
  @IsString()
  instagramUrl?: string;
}
