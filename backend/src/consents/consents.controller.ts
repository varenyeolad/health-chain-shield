import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('consents')
@Controller('consents')
export class ConsentsController {
  @Get() list() { return []; }
  @Get(':policyId') one(@Param('policyId') policyId: string) { return { policyId }; }
  @Get('requests') requests() { return []; }
  @Post('request') request(@Body() body: any) { return { status: 'REQUESTED', ...body }; }
  @Post('grant') grant(@Body() body: any) { return { status: 'ACTIVE', ...body }; }
  @Post('decline') decline(@Body() body: any) { return { status: 'DECLINED', ...body }; }
  @Post('revoke') revoke(@Body() body: any) { return { status: 'REVOKED', ...body }; }
  @Post('check') check(@Body() body: any) { return { allowed: false, ...body }; }
}
