import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('me')
  getMyDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getMyDashboard(user.userId);
  }

  @Get('team')
  @Roles(Role.ADMIN, Role.MANAGER)
  getTeamDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getTeamDashboard(
      user.userId,
      user.companyId,
      user.role,
    );
  }
}
