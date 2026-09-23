import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EstadoTurno } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/role';
import { AsignarTurnoDto } from './dto/asignar-turno.dto';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { TurnosService } from './turnos.service';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Get()
  findPublic(@Query('doctorId') doctorId?: string) {
    return this.turnosService.findPublic(doctorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllForAdmin(
    @CurrentUser() user: AuthUser,
    @Query('doctorId') doctorId?: string,
    @Query('estado') estado?: EstadoTurno,
    @Query('fecha') fecha?: string,
  ) {
    return this.turnosService.findAllForAdmin(user, doctorId, estado, fecha);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createTurnoDto: CreateTurnoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.turnosService.create(createTurnoDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/asignar')
  asignar(
    @Param('id') id: string,
    @Body() asignarTurnoDto: AsignarTurnoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.turnosService.asignar(id, asignarTurnoDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/liberar')
  liberar(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.turnosService.liberar(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.turnosService.remove(id, user);
  }
}
