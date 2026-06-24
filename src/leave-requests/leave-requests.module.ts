import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { HolidaysModule } from '../holidays/holidays.module';
import { DepartmentsModule } from '../departments/departments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, LeaveBalance, LeaveType]),
    HolidaysModule,
    DepartmentsModule,
    NotificationsModule,
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
  exports: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
