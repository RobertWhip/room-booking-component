import { Controller, Get, Post, Body, UsePipes,ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create_user.dto';
import { User } from './entities/user.entity';


/* TODO: 
	- add login - create auth.service
	- add pagination
	- add indices
	- add sorting by timestamp
	- add other CRUD operations
	- write tests
	- caching maybe
*/

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ description: 'Get all users' })
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Post()
  @ApiOperation({ description: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(
    @Body() createUserDto: CreateUserDto
	): Promise<User> {
    return this.userService.registerUser(createUserDto);
  }
}
