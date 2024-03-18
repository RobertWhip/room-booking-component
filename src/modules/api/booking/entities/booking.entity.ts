import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Room } from '../../room/entities/room.entity'; // Import the Room entity

@Entity('bookings')
export class Booking {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
  uuid: string;

  @ManyToOne(() => Room, room => room.timeSlots) // Establish a ManyToOne relation with Room entity
  @JoinColumn({ name: 'room_uuid' }) // Specify the join column
  @Exclude()
  room: Room; // Define the property to hold the Room entity

  @Column({ name: 'room_uuid', nullable: false }) // Map to the room_uuid column in the database
  roomUuid: string;

  @Column({ name: 'user_uuid', nullable: false }) // Map to the user_uuid column in the database
  userUuid: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }) // Define status column
  status: 'ACTIVE' | 'INACTIVE'; // Define the property to hold the status
}
