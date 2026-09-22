import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

const publicSelect = {
  id: true,
  nombre: true,
  apellido: true,
  especialidad: true,
  fotoUrl: true,
  descripcion: true,
  activo: true,
} as const;

const adminSelect = {
  ...publicSelect,
  username: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.doctor.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: publicSelect,
    });
  }

  findAllForAdmin() {
    return this.prisma.doctor.findMany({
      orderBy: { nombre: 'asc' },
      select: adminSelect,
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      select: publicSelect,
    });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }
    return doctor;
  }

  private async assertUsernameDisponible(username: string, ignoreId?: string) {
    const existente = await this.prisma.doctor.findUnique({
      where: { username },
    });
    if (existente && existente.id !== ignoreId) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }
  }

  async create(dto: CreateDoctorDto, fotoUrl?: string) {
    const { password, ...resto } = dto;
    await this.assertUsernameDisponible(dto.username);
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.doctor.create({
      data: { ...resto, passwordHash, fotoUrl },
      select: adminSelect,
    });
  }

  async update(id: string, dto: UpdateDoctorDto, fotoUrl?: string) {
    await this.findOne(id);
    const { password, ...resto } = dto;
    if (resto.username) {
      await this.assertUsernameDisponible(resto.username, id);
    }
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    return this.prisma.doctor.update({
      where: { id },
      data: {
        ...resto,
        ...(passwordHash ? { passwordHash } : {}),
        ...(fotoUrl ? { fotoUrl } : {}),
      },
      select: adminSelect,
    });
  }

  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }
    if (doctor.fotoUrl) {
      const filePath = path.join(process.cwd(), doctor.fotoUrl);
      fs.promises.unlink(filePath).catch(() => undefined);
    }
    await this.prisma.doctor.delete({ where: { id } });
    return { ok: true };
  }
}
