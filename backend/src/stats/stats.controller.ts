import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { StatsService } from './stats.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('JEFA')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('resumen')
  resumen() {
    return this.statsService.resumen();
  }
}
