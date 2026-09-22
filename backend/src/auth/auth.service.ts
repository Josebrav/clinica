import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { Role } from './role';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ username, password }: LoginDto) {
    const secretaria = await this.prisma.secretaria.findUnique({
      where: { username },
    });

    if (secretaria) {
      const passwordValida = await bcrypt.compare(
        password,
        secretaria.passwordHash,
      );
      if (!passwordValida) {
        throw new UnauthorizedException('Usuario o contraseña incorrectos');
      }
      return this.buildResponse(
        secretaria.id,
        secretaria.username,
        secretaria.rol,
      );
    }

    const doctor = await this.prisma.doctor.findUnique({ where: { username } });

    if (!doctor || !doctor.passwordHash) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, doctor.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return this.buildResponse(
      doctor.id,
      doctor.username as string,
      'MEDICO',
      doctor.id,
      `${doctor.nombre} ${doctor.apellido}`,
    );
  }

  private async buildResponse(
    sub: string,
    username: string,
    role: Role,
    doctorId?: string,
    nombreCompleto?: string,
  ) {
    const payload = { sub, username, role, doctorId };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      username,
      role,
      doctorId,
      nombreCompleto,
    };
  }
}
