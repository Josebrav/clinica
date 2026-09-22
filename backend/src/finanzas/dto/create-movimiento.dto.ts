import { TipoMovimiento } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateMovimientoDto {
  @IsEnum(TipoMovimiento)
  tipo: TipoMovimiento;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsString()
  @MinLength(2)
  concepto: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener formato YYYY-MM-DD',
  })
  fecha: string;
}
