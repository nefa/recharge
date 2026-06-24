import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveType } from '../entities/leave-type.entity';

@Injectable()
export class LeaveBalancesService {
  constructor(
    @InjectRepository(LeaveBalance) private balanceRepo: Repository<LeaveBalance>,
    @InjectRepository(LeaveType) private leaveTypeRepo: Repository<LeaveType>,
  ) {}

  async createDefaults(
    userId: string,
    companyId: string,
    year: number,
    manager?: EntityManager,
  ) {
    const ltRepo = manager
      ? manager.getRepository(LeaveType)
      : this.leaveTypeRepo;
    const balRepo = manager
      ? manager.getRepository(LeaveBalance)
      : this.balanceRepo;

    const leaveTypes = await ltRepo.find({ where: { companyId } });

    const balances = leaveTypes.map((lt) =>
      balRepo.create({
        userId,
        leaveTypeId: lt.id,
        year,
        allowanceDays: lt.defaultDays,
        usedDays: 0,
      }),
    );

    return balRepo.save(balances);
  }

  async getByUser(userId: string, year: number) {
    const balances = await this.balanceRepo.find({
      where: { userId, year },
      relations: { leaveType: true },
      order: { leaveType: { name: 'ASC' } },
    });

    return balances.map((b) => ({
      id: b.id,
      leaveTypeId: b.leaveTypeId,
      leaveTypeName: b.leaveType?.name ?? '',
      leaveTypeColor: b.leaveType?.color ?? '#0B7A75',
      year: b.year,
      allowanceDays: Number(b.allowanceDays),
      usedDays: Number(b.usedDays),
      remainingDays: Number(b.allowanceDays) - Number(b.usedDays),
    }));
  }

  async adjustAllowance(balanceId: string, allowanceDays: number) {
    await this.balanceRepo.update(balanceId, { allowanceDays });
    return this.balanceRepo.findOne({ where: { id: balanceId } });
  }
}
