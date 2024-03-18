import { IsString, IsNumber, IsEmail } from 'class-validator';

// TODO: use this DTO to update existing users

export class UserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  login: number;

  @IsString()
  password: string;
}