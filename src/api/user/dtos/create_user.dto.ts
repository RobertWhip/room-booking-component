import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // I made them optional so you won't have to
  // enter all the fields when testing the API
  // 👇

  @IsEmail()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  login: number;

  @IsString()
  @IsOptional()
  password: string;
}
