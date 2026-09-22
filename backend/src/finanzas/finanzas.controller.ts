import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/role';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { FinanzasService } from './finanzas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('JEFA')
@Controller('finanzas/movimientos')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  @Get()
  findAll() {
    return this.finanzasService.findAll();
  }

  @Post()
  create(@Body() dto: CreateMovimientoDto, @CurrentUser() user: AuthUser) {
    return this.finanzasService.create(dto, user.username);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.finanzasService.remove(id);
  }
}
