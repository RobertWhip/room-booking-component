import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Room } from './room.entity'; // Import the Room entity

@Entity('room_time_slots')
export class RoomTimeSlot {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
  uuid: string;

  @ManyToOne(() => Room, (room) => room.timeSlots) // Establish a ManyToOne relation with Room entity
  @JoinColumn({ name: 'room_uuid' }) // Specify the join column
  @Exclude()
  room?: Room; // Define the property to hold the Room entity

  @Column({ name: 'room_uuid', nullable: false }) // Map to the room_uuid column in the database
  roomUuid?: string;

  @Column({ type: 'timestamp', nullable: false, name: 'start_date_time' })
  startDateTime: Date; // Start date and time of the time slot

  @Column({ type: 'timestamp', nullable: false, name: 'end_date_time' })
  endDateTime: Date; // End date and time of the time slot

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt?: Date;
}
