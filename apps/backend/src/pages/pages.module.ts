import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminPagesController, PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [AuthModule],
  controllers: [PagesController, AdminPagesController],
  providers: [PagesService],
})
export class PagesModule {}
