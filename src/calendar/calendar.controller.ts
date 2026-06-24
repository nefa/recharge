import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get('wallchart')
  getWallchart(
    @CurrentUser() user: JwtPayload,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.calendarService.getWallchart(
      user.companyId,
      start,
      end,
      departmentId,
    );
  }
}
