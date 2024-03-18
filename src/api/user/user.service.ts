import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dtos/create_user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	// TODO: add pagination 'cuz it will kill the system 
	// if this code will ever be deployed on production.
	// PS: add indices too.
  getUsers(): Promise<User[]> {
	console.log(process.env)
		return this.userRepo.find();
  }

	// TODO: hash the password
	registerUser(userDto: CreateUserDto): Promise<User> {
		const user = plainToClass(User, userDto);
		return this.userRepo.save(user);
	}
};