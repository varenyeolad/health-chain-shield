import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterRecordDto {
  @ApiProperty()
  @IsString()
  patientId!: string;

  @ApiProperty({ enum: ['Patient', 'DiagnosticReport', 'Observation', 'Encounter', 'MedicationRequest', 'Condition', 'ImagingStudy', 'AllergyIntolerance'] })
  @IsIn(['Patient', 'DiagnosticReport', 'Observation', 'Encounter', 'MedicationRequest', 'Condition', 'ImagingStudy', 'AllergyIntolerance'])
  recordType!: string;

  @ApiProperty({ description: 'FHIR JSON or generic clinical payload' })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceSystem?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
