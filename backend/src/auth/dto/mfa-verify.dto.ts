import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class MfaVerifyDto {
  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code!: string;
}
