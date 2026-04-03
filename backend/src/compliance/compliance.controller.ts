import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('compliance')
@Controller('compliance')
export class ComplianceController {
  @Get() list() { return []; }
  @Post() post(@Body() body: any) { return { ok: true, ...body }; }
}
