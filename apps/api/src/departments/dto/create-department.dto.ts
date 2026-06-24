import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;
}
