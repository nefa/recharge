import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LeaveTypesService } from './leave-types.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums';

@Controller('leave-types')
export class LeaveTypesController {
  constructor(private leaveTypesService: LeaveTypesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.leaveTypesService.findByCompany(user.companyId);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeaveTypeDto) {
    return this.leaveTypesService.create(user.companyId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return this.leaveTypesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leaveTypesService.remove(id, user.companyId);
  }
}
