export const databaseConfig = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'room_booking',
    password: 'room_booking',
    database: 'room_booking_db',
    autoLoadEntities: true,
    synchronize: true, // TODO: turn off when gets deployed to prod, and use migrations
  };