import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CursosModule } from '../cursos/cursos.module';
import { TurmasModule } from '../turmas/turmas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { appConfig } from './configs/app.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: (config: ConfigType<typeof appConfig>) => ({
        type: config.database.type as 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        autoLoadEntities: true,
      }),
    }),
    CursosModule,
    TurmasModule,
    UsuariosModule,
  ],
  providers: [],
})
export class AppModule {}
