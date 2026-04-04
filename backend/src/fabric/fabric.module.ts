import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FABRIC_GATEWAY } from './gateway/fabric-gateway.port';
import { HyperledgerFabricGateway } from './gateway/hyperledger-fabric.gateway';
import { MockFabricGateway } from './gateway/mock-fabric.gateway';

@Module({
  providers: [
    MockFabricGateway,
    HyperledgerFabricGateway,
    {
      provide: FABRIC_GATEWAY,
      inject: [ConfigService, MockFabricGateway, HyperledgerFabricGateway],
      useFactory: (
        config: ConfigService,
        mockGateway: MockFabricGateway,
        fabricGateway: HyperledgerFabricGateway,
      ) => (config.get<string>('FABRIC_MODE', 'mock') === 'fabric' ? fabricGateway : mockGateway),
    },
  ],
  exports: [FABRIC_GATEWAY],
})
export class FabricModule {}
