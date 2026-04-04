import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  @Get() list() { return []; }
  @Post() create(@Body() body: any) { return { id: 'org_new', ...body }; }
  @Patch(':id') patch(@Param('id') id: string, @Body() body: any) { return { id, ...body }; }
}
