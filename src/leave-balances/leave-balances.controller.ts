import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LeaveBalancesService } from './leave-balances.service';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums';

@Controller('leave-balances')
export class LeaveBalancesController {
  constructor(private leaveBalancesService: LeaveBalancesService) {}

  @Get('me')
  async getMyBalances(
    @CurrentUser() user: JwtPayload,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.leaveBalancesService.getByUser(user.userId, year);
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN)
  async getByUser(
    @Param('userId') userId: string,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
  ) {
    return this.leaveBalancesService.getByUser(userId, year);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async adjustAllowance(
    @Param('id') id: string,
    @Body() dto: AdjustBalanceDto,
  ) {
    return this.leaveBalancesService.adjustAllowance(id, dto.allowanceDays);
  }
}
