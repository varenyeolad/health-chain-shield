import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyRecordDto {
  @ApiProperty()
  @IsString()
  recordId!: string;
}
