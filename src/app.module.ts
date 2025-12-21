import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { SummariesModule } from './summaries/summaries.module';
@Module({
  imports: [TypeOrmModule.forRoot(TypeOrmConfig), AuthModule, SummariesModule],
})
export class AppModule {}
