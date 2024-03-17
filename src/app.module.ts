import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APIModule } from './modules/api/api.module';

@Module({
  imports: [APIModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
