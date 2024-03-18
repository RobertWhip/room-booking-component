import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { BookingModule } from './booking/booking.module';

// TODO: add configs

const apiModules = [
  UserModule, 
  RoomModule,
  BookingModule,
];

@Module({
  imports: apiModules,
  exports: apiModules,
})
export class ApiModule {}
