import { Module } from '@nestjs/common';
import { ConsentsController } from './consents.controller';
import { ConsentsService } from './consents.service';
import { FabricModule } from '../fabric/fabric.module';

@Module({ imports: [FabricModule], controllers: [ConsentsController], providers: [ConsentsService], exports: [ConsentsService] })
export class ConsentsModule {}
