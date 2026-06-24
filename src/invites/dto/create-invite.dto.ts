import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../entities/enums';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
