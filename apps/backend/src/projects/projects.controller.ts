import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { Project, ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    listPublished(): Promise<Project[]> {
        return this.projectsService.listPublished();
    }

    @Get(':slug')
    findPublishedBySlug(@Param('slug') slug: string): Promise<Project> {
        return this.projectsService.findPublishedBySlug(slug);
    }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class AdminProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    listAdmin(): Promise<Project[]> {
        return this.projectsService.listAdmin();
    }

    @Get(':id')
    findAdminById(@Param('id') id: string): Promise<Project> {
        return this.projectsService.findAdminById(id);
    }

    @Post()
    create(@Body() dto: CreateProjectDto): Promise<Project> {
        return this.projectsService.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateProjectDto,
    ): Promise<Project> {
        return this.projectsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    delete(@Param('id') id: string): Promise<void> {
        return this.projectsService.delete(id);
    }
}
