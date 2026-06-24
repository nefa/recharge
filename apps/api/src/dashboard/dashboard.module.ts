import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../entities/user.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Department } from '../entities/department.entity';
import { LeaveBalancesModule } from '../leave-balances/leave-balances.module';
import { LeaveRequestsModule } from '../leave-requests/leave-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LeaveRequest, Department]),
    LeaveBalancesModule,
    LeaveRequestsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
