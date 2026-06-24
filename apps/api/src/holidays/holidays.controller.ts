import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { HolidaysService } from './holidays.service';

@Controller('holidays')
export class HolidaysController {
  constructor(private holidaysService: HolidaysService) {}

  @Get()
  async findByYear(@Query('year', ParseIntPipe) year: number) {
    const holidays = await this.holidaysService.findByYear(year);
    return holidays.map((h) => ({
      id: h.id,
      date:
        h.date instanceof Date
          ? h.date.toISOString().split('T')[0]
          : String(h.date),
      name: h.name,
      year: h.year,
    }));
  }
}
