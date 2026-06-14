import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { NotesModule } from './notes/notes.module';
import { PagesModule } from './pages/pages.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
    imports: [
        DatabaseModule,
        HealthModule,
        AuthModule,
        ProjectsModule,
        PagesModule,
        NotesModule,
    ],
})
export class AppModule {}
