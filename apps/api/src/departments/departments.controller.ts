import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums';

@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.departmentsService.findByCompany(user.companyId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    const dept = await this.departmentsService.findOne(id, user.companyId);
    return {
      id: dept.id,
      name: dept.name,
      managerId: dept.managerId,
      managerName: dept.manager?.name ?? null,
      memberCount: dept.members?.length ?? 0,
    };
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(user.companyId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.departmentsService.remove(id, user.companyId);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assignUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AssignUserDto,
  ) {
    return this.departmentsService.assignUser(id, dto.userId, user.companyId);
  }
}
