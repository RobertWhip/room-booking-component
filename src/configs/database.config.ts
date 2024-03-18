import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', () => ({
	type: process.env.DB_TYPE || 'postgres',
	host: process.env.DATABASE_HOST || 'localhost',
	port: process.env.DATABASE_PORT || 5432,
	username: process.env.DB_USERNAME || 'room_booking',
    password: process.env.DB_PASSWORD || 'room_booking',
    database: process.env.DB_NAME || 'room_booking_db',

    autoLoadEntities: true,
	// TODO: turn off when gets deployed to prod, and use migrations
    synchronize: true, 
  } as TypeOrmModuleOptions));