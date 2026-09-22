import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class FinanzasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.movimiento.findMany({
      orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    });
  }

  create(dto: CreateMovimientoDto, creadoPor?: string) {
    return this.prisma.movimiento.create({ data: { ...dto, creadoPor } });
  }

  async remove(id: string) {
    const existente = await this.prisma.movimiento.findUnique({
      where: { id },
    });
    if (!existente) {
      throw new NotFoundException('Movimiento no encontrado');
    }
    await this.prisma.movimiento.delete({ where: { id } });
    return { ok: true };
  }
}
