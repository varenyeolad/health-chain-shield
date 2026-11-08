import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SUPPORTED_FHIR_RESOURCES, validateFhirResource } from './fhir-validation';

@ApiTags('fhir')
@Controller('fhir')
export class FhirController {
  @Post('validate')
  validate(@Body() body: unknown) {
    return validateFhirResource(body);
  }

  @Post('map')
  map(@Body() body: unknown) {
    const validation = validateFhirResource(body);
    if (!validation.valid) throw new HttpException({ status: 'VALIDATION_FAILED', ...validation }, HttpStatus.BAD_REQUEST);
    // Resource preview only. No EHR export, persistent mapping or backend transformation is claimed.
    return { status: 'VALIDATED', resourceType: validation.resourceType, data: body };
  }

  @Get('mappings')
  mappings() {
    return SUPPORTED_FHIR_RESOURCES.map(resourceType => ({
      resourceType, status: 'STRUCTURAL_SCREENING_ONLY',
    }));
  }

  @Post('mappings/:id/retry')
  retry(@Param('id') _id: string) {
    throw new HttpException('No asynchronous FHIR mapping pipeline configured', HttpStatus.NOT_IMPLEMENTED);
  }

  @Get('metadata')
  metadata() {
    return {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString().slice(0, 10),
      kind: 'instance',
      fhirVersion: '4.0.1',
      format: ['json'],
      implementation: { description: 'Health Chain Shield structural screening API, not a full FHIR repository' },
    };
  }
}
