import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessService } from './access.service';

@ApiTags('access')
@Controller('access')
export class AccessController {
  constructor(private readonly access: AccessService) {}

  @Post('request')
  request(@Body() body: any) { return { status: 'PENDING', ...body }; }

  @Post('retrieve')
  retrieve(@Body() body: { recordId: string; patientPseudoId: string; granteeOrgId: string; purpose: string }) {
    return this.access.retrieve(body);
  }

  @Post('emergency')
  emergency(@Body() body: any) { return { status: 'EMERGENCY_RECORDED', ...body }; }
}
