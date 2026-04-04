import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get() list() { return []; }
  @Post('invite') invite(@Body() body: any) { return { invited: true, ...body }; }
  @Patch(':id/role') patchRole(@Param('id') id: string, @Body() body: any) { return { id, ...body }; }
}
