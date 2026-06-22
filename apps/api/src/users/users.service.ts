import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email }, relations: { company: true } });
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id }, relations: { company: true } });
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { company: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      departmentId: user.departmentId,
      companyName: user.company?.name ?? '',
    };
  }

  async listByCompany(companyId: string) {
    const users = await this.userRepo.find({
      where: { companyId },
      relations: { department: true },
      order: { name: 'ASC' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      departmentId: u.departmentId,
      departmentName: u.department?.name ?? null,
    }));
  }
}
