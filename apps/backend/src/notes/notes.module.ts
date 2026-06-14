import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import {
  AdminNotesController,
  AdminProjectUpdatesController,
  GithubProjectUpdatesController,
  NotesController,
} from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [AuthModule],
  controllers: [
    NotesController,
    GithubProjectUpdatesController,
    AdminNotesController,
    AdminProjectUpdatesController,
  ],
  providers: [NotesService],
})
export class NotesModule {}
