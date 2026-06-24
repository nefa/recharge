import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveBalancesController } from './leave-balances.controller';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveBalance, LeaveType])],
  controllers: [LeaveBalancesController],
  providers: [LeaveBalancesService],
  exports: [LeaveBalancesService],
})
export class LeaveBalancesModule {}
