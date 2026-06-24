import { IsEnum } from 'class-validator';
import { LeaveStatus } from '../../entities/enums';

export class UpdateLeaveRequestDto {
  @IsEnum(LeaveStatus, {
    message: 'Status must be approved or declined',
  })
  status: LeaveStatus.APPROVED | LeaveStatus.DECLINED;
}
