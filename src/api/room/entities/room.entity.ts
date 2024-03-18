import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

import { User } from '../../user/entities/user.entity'; // Import the User entity
import { RoomTimeSlot } from './room_time_slot.entity'; // Import the RoomTimeSlot entity

@Entity('rooms')
export class Room {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
  uuid: string;

  @Column({ nullable: true })
  name: string; 

  @ManyToOne(() => User, { nullable: true }) // Establish a ManyToOne relation with User entity
  createdByUser: User;

  @Column({ nullable: true })

  @Column({ name: 'user_uuid' }) // Map to the room_uuid column in the database
  userUuid: string;

  @OneToMany(() => RoomTimeSlot, timeSlot => timeSlot.room) // Establish a OneToMany relation with RoomTimeSlot entity
  timeSlots: RoomTimeSlot[]; // Define the property to hold the RoomTimeSlot entities

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;
}