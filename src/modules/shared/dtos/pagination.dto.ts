import { IsInt, Min } from 'class-validator';

// TODO: implement pagination into GET routes
export class PaginationDto {
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  pageSize: number = 25;
}
