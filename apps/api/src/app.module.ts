import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeaveTypesModule } from './leave-types/leave-types.module';
import { HolidaysModule } from './holidays/holidays.module';
import { DepartmentsModule } from './departments/departments.module';
import { InvitesModule } from './invites/invites.module';
import { LeaveBalancesModule } from './leave-balances/leave-balances.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Company } from './entities/company.entity';
import { User } from './entities/user.entity';
import { Department } from './entities/department.entity';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { PublicHoliday } from './entities/public-holiday.entity';
import { Invite } from './entities/invite.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [
          Company,
          User,
          Department,
          LeaveType,
          LeaveBalance,
          LeaveRequest,
          PublicHoliday,
          Invite,
          RefreshToken,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    LeaveTypesModule,
    HolidaysModule,
    DepartmentsModule,
    InvitesModule,
    LeaveBalancesModule,
    LeaveRequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
