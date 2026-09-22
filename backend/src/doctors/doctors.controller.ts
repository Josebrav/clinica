import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorsService } from './doctors.service';
import { doctorPhotoMulterOptions } from './multer.config';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAllPublic() {
    return this.doctorsService.findAllPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECRETARIA', 'JEFA')
  @Get('admin/all')
  findAllForAdmin() {
    return this.doctorsService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECRETARIA', 'JEFA')
  @Post()
  @UseInterceptors(FileInterceptor('foto', doctorPhotoMulterOptions))
  create(
    @Body() createDoctorDto: CreateDoctorDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    const fotoUrl = foto ? `/uploads/doctors/${foto.filename}` : undefined;
    return this.doctorsService.create(createDoctorDto, fotoUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECRETARIA', 'JEFA')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto', doctorPhotoMulterOptions))
  update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    const fotoUrl = foto ? `/uploads/doctors/${foto.filename}` : undefined;
    return this.doctorsService.update(id, updateDoctorDto, fotoUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SECRETARIA', 'JEFA')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
