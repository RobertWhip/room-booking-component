import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { Booking } from './booking.entity';

@Entity('booking_time_slots')
export class BookingTimeSlot {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
  uuid: string;

  @Column({ name: 'user_uuid', nullable: false })
  userUuid: string;

  @Column({ name: 'room_uuid', nullable: false })
  roomUuid: string;

  @ManyToOne(() => Booking) // Establish a ManyToOne relation with Booking entity
  @JoinColumn({ name: 'booking_uuid' }) // Specify the join column
  booking: Booking; // Define the property to hold the Booking entity

  @Column({ name: 'booking_uuid', nullable: false })
  bookingUuid: string;

  @Column({ name: 'room_time_slot_uuid', nullable: false })
  roomTimeSlotUuid: string;
}
