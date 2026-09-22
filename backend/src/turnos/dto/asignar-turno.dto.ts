import { IsOptional, IsString, MinLength } from 'class-validator';

export class AsignarTurnoDto {
  @IsString()
  @MinLength(2)
  pacienteNombre: string;

  @IsString()
  @MinLength(6)
  pacienteTelefono: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
