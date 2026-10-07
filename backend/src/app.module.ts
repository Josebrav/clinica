import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { FinanzasModule } from './finanzas/finanzas.module';
import { PrismaModule } from './prisma/prisma.module';
import { StatsModule } from './stats/stats.module';
import { TurnosModule } from './turnos/turnos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DoctorsModule,
    TurnosModule,
    FinanzasModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
