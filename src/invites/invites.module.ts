import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { Invite } from '../entities/invite.entity';
import { User } from '../entities/user.entity';
import { LeaveBalancesModule } from '../leave-balances/leave-balances.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, User]),
    LeaveBalancesModule,
    NotificationsModule,
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
