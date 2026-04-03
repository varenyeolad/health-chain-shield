import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  @Get('patient') patient() { return []; }
  @Get('provider') provider() { return []; }
  @Get('consumer') consumer() { return []; }
  @Get('regulator') regulator() { return []; }
  @Post('export') export(@Body() body: any) { return { status: 'QUEUED', ...body }; }
  @Post('log-access') log(@Body() body: any) { return { logged: true, ...body }; }
}
