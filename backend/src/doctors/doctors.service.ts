import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { cloudinary } from './cloudinary.config';
import type { AuthUser } from '../auth/role';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdateInstagramDto } from './dto/update-instagram.dto';

const publicSelect = {
  id: true,
  nombre: true,
  apellido: true,
  especialidad: true,
  fotoUrl: true,
  descripcion: true,
  instagramUrl: true,
  activo: true,
} as const;

const adminSelect = {
  ...publicSelect,
  username: true,
  createdAt: true,
  updatedAt: true,
} as const;

interface FotoSubida {
  fotoUrl?: string;
  fotoPublicId?: string;
}

async function eliminarFotoCloudinary(publicId?: string | null) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId).catch(() => undefined);
}

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

  async create(dto: CreateDoctorDto, foto?: FotoSubida) {
    const { password, ...resto } = dto;
    await this.assertUsernameDisponible(dto.username);
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.doctor.create({
      data: { ...resto, passwordHash, ...foto },
      select: adminSelect,
    });
  }

  async update(id: string, dto: UpdateDoctorDto, foto?: FotoSubida) {
    const actual = await this.prisma.doctor.findUnique({ where: { id } });
    if (!actual) {
      throw new NotFoundException('Médico no encontrado');
    }
    const { password, ...resto } = dto;
    if (resto.username) {
      await this.assertUsernameDisponible(resto.username, id);
    }
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const actualizado = await this.prisma.doctor.update({
      where: { id },
      data: {
        ...resto,
        ...(passwordHash ? { passwordHash } : {}),
        ...foto,
      },
      select: adminSelect,
    });
    if (foto?.fotoPublicId && actual.fotoPublicId) {
      await eliminarFotoCloudinary(actual.fotoPublicId);
    }
    return actualizado;
  }

  async updateInstagram(
    id: string,
    dto: UpdateInstagramDto,
    requester: AuthUser,
  ) {
    if (requester.role === 'MEDICO' && requester.doctorId !== id) {
      throw new ForbiddenException('No podés editar el perfil de otro médico');
    }
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }
    return this.prisma.doctor.update({
      where: { id },
      data: { instagramUrl: dto.instagramUrl || null },
      select: publicSelect,
    });
  }

  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }
    await eliminarFotoCloudinary(doctor.fotoPublicId);
    await this.prisma.doctor.delete({ where: { id } });
    return { ok: true };
  }
}
