import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreatePlantillaDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener formato YYYY-MM-DD',
  })
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'horaInicio debe tener formato HH:mm',
  })
  horaInicio: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'horaFin debe tener formato HH:mm',
  })
  horaFin: string;

  @IsInt()
  @Min(5)
  @Max(60)
  intervaloMinutos: number;
}
