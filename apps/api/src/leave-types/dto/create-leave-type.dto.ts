import { IsString, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  defaultDays?: number;
}
