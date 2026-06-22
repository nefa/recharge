import { Controller, Get, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: JwtPayload) {
    const user = await this.usersService.getMe(currentUser.userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  async listByCompany(@CurrentUser() currentUser: JwtPayload) {
    return this.usersService.listByCompany(currentUser.companyId);
  }
}
