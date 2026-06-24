import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { LeaveStatus } from '../entities/enums';
import { HolidaysService } from '../holidays/holidays.service';
import type { WallchartDay, WallchartEntry } from '@recharge/shared';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(LeaveRequest) private requestRepo: Repository<LeaveRequest>,
    private holidaysService: HolidaysService,
  ) {}

  async getWallchart(
    companyId: string,
    startDate: string,
    endDate: string,
    departmentId?: string,
  ): Promise<WallchartEntry[]> {
    const userWhere: Record<string, unknown> = { companyId };
    if (departmentId) userWhere.departmentId = departmentId;

    const users = await this.userRepo.find({
      where: userWhere,
      relations: { department: true },
      order: { name: 'ASC' },
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    const requests = await this.requestRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.leaveType', 'leaveType')
      .leftJoinAndSelect('r.user', 'user')
      .where('user.companyId = :companyId', { companyId })
      .andWhere('r.status = :status', { status: LeaveStatus.APPROVED })
      .andWhere('r.start_date <= :end', { end: endDate })
      .andWhere('r.end_date >= :start', { start: startDate })
      .getMany();

    if (departmentId) {
      const filteredUserIds = new Set(users.map((u) => u.id));
      requests.splice(
        0,
        requests.length,
        ...requests.filter((r) => filteredUserIds.has(r.userId)),
      );
    }

    const holidayDates = await this.holidaysService.getHolidayDatesForRange(
      start,
      end,
    );

    const requestsByUser = new Map<string, LeaveRequest[]>();
    for (const req of requests) {
      const list = requestsByUser.get(req.userId) ?? [];
      list.push(req);
      requestsByUser.set(req.userId, list);
    }

    return users.map((user) => {
      const userRequests = requestsByUser.get(user.id) ?? [];
      const days = this.buildDays(start, end, userRequests, holidayDates);

      return {
        userId: user.id,
        userName: user.name,
        departmentName: user.department?.name ?? null,
        days,
      };
    });
  }

  private buildDays(
    start: Date,
    end: Date,
    requests: LeaveRequest[],
    holidayDates: Set<string>,
  ): WallchartDay[] {
    const days: WallchartDay[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        days.push({ date: dateStr, type: 'weekend' });
      } else if (holidayDates.has(dateStr)) {
        days.push({ date: dateStr, type: 'holiday' });
      } else {
        const matchingRequest = requests.find((r) => {
          const rStart =
            r.startDate instanceof Date
              ? r.startDate.toISOString().split('T')[0]
              : String(r.startDate);
          const rEnd =
            r.endDate instanceof Date
              ? r.endDate.toISOString().split('T')[0]
              : String(r.endDate);
          return dateStr >= rStart && dateStr <= rEnd;
        });

        if (matchingRequest) {
          days.push({
            date: dateStr,
            type: 'leave',
            leaveType: matchingRequest.leaveType?.name,
            leaveColor: matchingRequest.leaveType?.color,
          });
        } else {
          days.push({ date: dateStr, type: null });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return days;
  }
}
