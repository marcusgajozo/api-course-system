import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { appConfig } from './app.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: (config: ConfigType<typeof appConfig>) => ({
        type: config.database.type as 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.user,
        password: config.database.password,
        database: config.database.name,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [],
})
export class AppModule {}
