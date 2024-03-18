import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';

// TODO: add configs

@Module({
  imports: [UserModule, RoomModule],
  exports: [UserModule, RoomModule],
})
export class ApiModule {}
