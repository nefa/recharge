import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PublicHoliday } from '../entities/public-holiday.entity';
import { ROMANIAN_HOLIDAYS } from './data/romanian-holidays';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(PublicHoliday) private repo: Repository<PublicHoliday>,
  ) {}

  async seed(manager?: EntityManager) {
    const repo = manager ? manager.getRepository(PublicHoliday) : this.repo;

    for (const [yearStr, holidays] of Object.entries(ROMANIAN_HOLIDAYS)) {
      const year = Number(yearStr);
      for (const h of holidays) {
        const existing = await repo.findOne({
          where: { country: 'RO', date: new Date(h.date) },
        });
        if (!existing) {
          await repo.save(repo.create({
            country: 'RO',
            date: new Date(h.date),
            name: h.name,
            year,
          }));
        }
      }
    }
  }

  async findByYear(year: number) {
    return this.repo.find({
      where: { year, country: 'RO' },
      order: { date: 'ASC' },
    });
  }

  async isHoliday(date: Date): Promise<boolean> {
    const count = await this.repo.count({
      where: { country: 'RO', date },
    });
    return count > 0;
  }

  async getHolidayDatesForRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Set<string>> {
    const holidays = await this.repo
      .createQueryBuilder('h')
      .where('h.country = :country', { country: 'RO' })
      .andWhere('h.date >= :start', { start: startDate })
      .andWhere('h.date <= :end', { end: endDate })
      .getMany();

    return new Set(
      holidays.map((h) => {
        const d = h.date instanceof Date ? h.date : new Date(h.date);
        return d.toISOString().split('T')[0];
      }),
    );
  }
}
