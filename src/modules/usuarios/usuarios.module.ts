import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurmasModule } from '../turmas/turmas.module';
import { UsuariosController } from './controllers/usuarios.controller';
import { UsuarioEntity } from './entities/usuario.entity';
import { UsuariosService } from './services/usuarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity]), TurmasModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
