import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ description: 'Get all users' })
  getUsers(): string {
    return this.userService.getHello();
  }

  @Get()
  @ApiOperation({ description: 'Get user by ID' })
  getUser(): string {
    return this.userService.getHello();
  }

  @Post()
  @ApiOperation({ description: 'Register a new user' })
  registerUser(): string {
    return this.userService.getHello();
  }
}
