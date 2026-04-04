import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  @Get() list() { return []; }
  @Post() post(@Body() body: any) { return { ok: true, ...body }; }
}
