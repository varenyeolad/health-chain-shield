import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterRecordDto } from './dto/register-record.dto';
import { VerifyRecordDto } from './dto/verify-record.dto';
import { RecordsService } from './records.service';

@ApiTags('records')
@ApiBearerAuth()
@Controller('records')
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Get()
  list(@Query('patientId') patientId?: string) {
    return this.records.list(patientId);
  }

  @Get(':recordId')
  getOne(@Param('recordId') recordId: string) {
    return this.records.getById(recordId);
  }

  @Post('register')
  register(@Body() dto: RegisterRecordDto) {
    const actorOrgId = process.env.FABRIC_MODE === 'fabric' ? process.env.FABRIC_MSP_ID ?? 'Org1MSP' : 'ORG_HOSPITAL_A';
    return this.records.register(dto, actorOrgId);
  }

  @Post(':recordId/verify')
  verify(@Param('recordId') recordId: string, @Body() _dto: VerifyRecordDto) {
    return this.records.verify(recordId);
  }

  @Post(':recordId/upload')
  uploadPlaceholder() {
    return { message: 'use /records/register for initial milestone; async upload to be wired with pre-signed URL flow' };
  }

  @Get(':recordId/versions')
  versionsPlaceholder() {
    return [];
  }
}
