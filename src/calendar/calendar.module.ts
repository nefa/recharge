import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { User } from '../entities/user.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { HolidaysModule } from '../holidays/holidays.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LeaveRequest]),
    HolidaysModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
