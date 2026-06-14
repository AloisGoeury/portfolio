import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    CreateNoteDto,
    GithubProjectUpdateDto,
    PublishQueuedProjectUpdateDto,
    UpdateNoteDto,
    UpdateQueuedProjectUpdateDto,
} from './notes.dto';
import { Note, NotesService, QueuedProjectUpdate } from './notes.service';

@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

    @Get()
    listPublished(): Promise<Note[]> {
        return this.notesService.listPublished();
    }
}

@Controller('integrations/github/project-updates')
export class GithubProjectUpdatesController {
    constructor(private readonly notesService: NotesService) {}

    @Post()
    receive(
        @Headers('authorization') authorization: string | undefined,
        @Body() dto: GithubProjectUpdateDto,
    ): Promise<QueuedProjectUpdate> {
        return this.notesService.receiveGithubUpdate(authorization, dto);
    }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/notes')
export class AdminNotesController {
    constructor(private readonly notesService: NotesService) {}

    @Get()
    list(): Promise<Note[]> {
        return this.notesService.listAdmin();
    }

    @Get(':id')
    find(@Param('id') id: string): Promise<Note> {
        return this.notesService.findAdminById(id);
    }

    @Post()
    create(@Body() dto: CreateNoteDto): Promise<Note> {
        return this.notesService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateNoteDto): Promise<Note> {
        return this.notesService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    delete(@Param('id') id: string): Promise<void> {
        return this.notesService.delete(id);
    }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/project-updates')
export class AdminProjectUpdatesController {
    constructor(private readonly notesService: NotesService) {}

    @Get()
    list(): Promise<QueuedProjectUpdate[]> {
        return this.notesService.listQueue();
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateQueuedProjectUpdateDto,
    ): Promise<QueuedProjectUpdate> {
        return this.notesService.updateQueueDraft(id, dto);
    }

    @Post(':id/publish')
    publish(
        @Param('id') id: string,
        @Body() dto: PublishQueuedProjectUpdateDto,
    ): Promise<Note> {
        return this.notesService.publishQueueItem(id, dto);
    }

    @Post(':id/ignore')
    ignore(@Param('id') id: string): Promise<QueuedProjectUpdate> {
        return this.notesService.ignoreQueueItem(id);
    }
}
