import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

// TODO: add configs

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
  exports: [UserModule],
})
export class ApiModule {}
