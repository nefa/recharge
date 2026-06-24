import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findByCompany(companyId: string) {
    const departments = await this.deptRepo.find({
      where: { companyId },
      relations: { manager: true, members: true },
      order: { name: 'ASC' },
    });

    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      managerId: d.managerId,
      managerName: d.manager?.name ?? null,
      memberCount: d.members?.length ?? 0,
    }));
  }

  async findOne(id: string, companyId: string) {
    const dept = await this.deptRepo.findOne({
      where: { id, companyId },
      relations: { manager: true, members: true },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(companyId: string, dto: CreateDepartmentDto) {
    if (dto.managerId) {
      await this.validateUserInCompany(dto.managerId, companyId);
    }

    const dept = this.deptRepo.create({ ...dto, companyId });
    const saved = await this.deptRepo.save(dept);
    return this.findOne(saved.id, companyId);
  }

  async update(id: string, companyId: string, dto: UpdateDepartmentDto) {
    const dept = await this.findOne(id, companyId);

    if (dto.managerId) {
      await this.validateUserInCompany(dto.managerId, companyId);
    }

    Object.assign(dept, dto);
    await this.deptRepo.save(dept);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const dept = await this.findOne(id, companyId);

    const memberCount = await this.userRepo.count({
      where: { departmentId: id, companyId },
    });
    if (memberCount > 0) {
      throw new BadRequestException(
        'Cannot delete department with assigned members',
      );
    }

    return this.deptRepo.remove(dept);
  }

  async assignUser(departmentId: string, userId: string, companyId: string) {
    await this.findOne(departmentId, companyId);
    const user = await this.validateUserInCompany(userId, companyId);
    user.departmentId = departmentId;
    await this.userRepo.save(user);
    return { ok: true };
  }

  async getManagerForUser(userId: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { department: { manager: true } },
    });
    return user?.department?.manager ?? null;
  }

  private async validateUserInCompany(
    userId: string,
    companyId: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId, companyId },
    });
    if (!user) {
      throw new BadRequestException('User not found in this company');
    }
    return user;
  }
}
