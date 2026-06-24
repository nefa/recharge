import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { User } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LeaveTypesModule } from '../leave-types/leave-types.module';
import { HolidaysModule } from '../holidays/holidays.module';
import { LeaveBalancesModule } from '../leave-balances/leave-balances.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature([User, Company, RefreshToken]),
    LeaveTypesModule,
    HolidaysModule,
    LeaveBalancesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
