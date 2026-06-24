import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../entities/enums';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInviteDto,
  ) {
    return this.invitesService.create(user.companyId, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  listAll(@CurrentUser() user: JwtPayload) {
    return this.invitesService.listByCompany(user.companyId);
  }

  @Public()
  @Get(':token')
  validate(@Param('token') token: string) {
    return this.invitesService.validate(token);
  }

  @Public()
  @Post(':token/accept')
  @HttpCode(HttpStatus.CREATED)
  accept(
    @Param('token') token: string,
    @Body() dto: AcceptInviteDto,
  ) {
    return this.invitesService.accept(token, dto);
  }
}
