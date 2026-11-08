import { Body, Controller, Get, Headers, HttpException, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import { FABRIC_GATEWAY, FabricGatewayPort, RecordMeta } from './gateway/fabric-gateway.port';

/**
 * Research-only bridge. Only enabled in explicit live-Fabric benchmark mode and
 * protected by a separate shared token. Place behind TLS / network restrictions.
 */
@Controller('benchmarks')
export class BenchmarkController {
  constructor(@Inject(FABRIC_GATEWAY) private readonly fabric: FabricGatewayPort) {}

  private authorize(authHeader?: string) {
    if (process.env.FABRIC_MODE !== 'fabric' || process.env.ENABLE_BENCHMARK_API !== 'true') {
      throw new HttpException('Benchmark bridge disabled', HttpStatus.NOT_FOUND);
    }
    const token = process.env.BENCHMARK_API_TOKEN;
    if (!token || token.length < 24 || authHeader !== 'Bearer ' + token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register-record')
  async register(@Headers('authorization') authorization: string, @Body() meta: RecordMeta) {
    this.authorize(authorization);
    if (!meta || typeof meta.recordId !== 'string' || !meta.recordId.startsWith('caliper-') && !meta.recordId.includes('-')) {
      throw new HttpException('Synthetic benchmark record ID required', HttpStatus.BAD_REQUEST);
    }
    if (typeof meta.objectUri !== 'string' || !meta.objectUri.startsWith('s3://synthetic-')) {
      throw new HttpException('Only synthetic benchmark objects are allowed', HttpStatus.BAD_REQUEST);
    }
    const result = await this.fabric.registerRecord({ ...meta, ownerOrgId: process.env.FABRIC_MSP_ID ?? meta.ownerOrgId });
    return { txId: result.txId, committed: true };
  }

  @Get('records/:recordId')
  async read(@Headers('authorization') authorization: string, @Param('recordId') recordId: string) {
    this.authorize(authorization);
    return this.fabric.getRecord(recordId);
  }
}
