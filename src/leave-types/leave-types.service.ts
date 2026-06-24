import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { LeaveType } from '../entities/leave-type.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

const ROMANIAN_DEFAULTS = [
  { name: 'Concediu de odihna', color: '#0B7A75', requiresApproval: true, isPaid: true, defaultDays: 21 },
  { name: 'Concediu medical', color: '#F57C00', requiresApproval: false, isPaid: true, defaultDays: 0 },
  { name: 'Concediu fara plata', color: '#9E9E9E', requiresApproval: true, isPaid: false, defaultDays: 0 },
  { name: 'Zi libera personala', color: '#5C6BC0', requiresApproval: true, isPaid: true, defaultDays: 3 },
  { name: 'Concediu de maternitate', color: '#E91E63', requiresApproval: true, isPaid: true, defaultDays: 126 },
  { name: 'Concediu de paternitate', color: '#2196F3', requiresApproval: true, isPaid: true, defaultDays: 10 },
];

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType) private repo: Repository<LeaveType>,
  ) {}

  async seedDefaults(companyId: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(LeaveType) : this.repo;
    const entities = ROMANIAN_DEFAULTS.map((d) =>
      repo.create({ ...d, companyId }),
    );
    return repo.save(entities);
  }

  async findByCompany(companyId: string) {
    return this.repo.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string) {
    const leaveType = await this.repo.findOne({ where: { id, companyId } });
    if (!leaveType) throw new NotFoundException('Leave type not found');
    return leaveType;
  }

  async create(companyId: string, dto: CreateLeaveTypeDto) {
    const leaveType = this.repo.create({ ...dto, companyId });
    return this.repo.save(leaveType);
  }

  async update(id: string, companyId: string, dto: UpdateLeaveTypeDto) {
    const leaveType = await this.findOne(id, companyId);
    Object.assign(leaveType, dto);
    return this.repo.save(leaveType);
  }

  async remove(id: string, companyId: string) {
    const leaveType = await this.findOne(id, companyId);
    return this.repo.remove(leaveType);
  }
}
