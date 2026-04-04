import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('fhir')
@Controller('fhir')
export class FhirController {
  @Post('validate') validate(@Body() body: any) { return { valid: true, resourceType: body?.resourceType ?? 'Unknown' }; }
  @Post('map') map(@Body() body: any) { return { status: 'MAPPED', ...body }; }
  @Get('mappings') mappings() { return []; }
  @Post('mappings/:id/retry') retry(@Param('id') id: string) { return { id, status: 'RETRY_QUEUED' }; }
}
