import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseClient, DatabaseService } from '../database/database.service';
import {
    CreateProjectDto,
    ProjectLinkDto,
    ProjectTagDto,
    UpdateProjectDto,
} from './projects.dto';
import { projectsSql } from './projects.sql';

export interface Project extends QueryResultRow {
    id: string;
    title: string;
    slug: string;
    summary: string;
    contentMarkdown: string;
    status: string;
    category: string | null;
    coverUrl: string | null;
    githubRepositoryUrl: string | null;
    lastCommitSha: string | null;
    lastCommitUrl: string | null;
    lastCommitMessage: string | null;
    lastCommitAt: string | null;
    featured: boolean;
    published: boolean;
    startedAt: string | null;
    endedAt: string | null;
    createdAt: string;
    updatedAt: string;
    tags: Array<ProjectTagDto & { id: string }>;
    links: Array<ProjectLinkDto & { id: string }>;
}

@Injectable()
export class ProjectsService {
    constructor(private readonly database: DatabaseService) {}

    async listPublished(): Promise<Project[]> {
        const result = await this.database.query<Project>(
            projectsSql.listPublished,
        );
        return result.rows;
    }

    async findPublishedBySlug(slug: string): Promise<Project> {
        const result = await this.database.query<Project>(
            projectsSql.findPublishedBySlug,
            [slug],
        );
        return this.requireProject(result.rows[0]);
    }

    async listAdmin(): Promise<Project[]> {
        const result = await this.database.query<Project>(
            projectsSql.listAdmin,
        );
        return result.rows;
    }

    async findAdminById(id: string): Promise<Project> {
        const result = await this.database.query<Project>(
            projectsSql.findAdminById,
            [id],
        );
        return this.requireProject(result.rows[0]);
    }

    async create(dto: CreateProjectDto): Promise<Project> {
        try {
            const id = await this.database.transaction(async (client) => {
                const result = await client.query<{ id: string }>(
                    projectsSql.create,
                    [
                        dto.title,
                        dto.slug,
                        dto.summary,
                        dto.contentMarkdown ?? '',
                        dto.status ?? (dto.published ? 'published' : 'draft'),
                        dto.category ?? null,
                        dto.coverUrl ?? null,
                        dto.githubRepositoryUrl ?? null,
                        dto.featured ?? false,
                        dto.published ?? false,
                        dto.startedAt ?? null,
                        dto.endedAt ?? null,
                    ],
                );
                const projectId = result.rows[0].id;
                await this.replaceRelations(
                    client,
                    projectId,
                    dto.tags ?? [],
                    dto.links ?? [],
                );
                return projectId;
            });

            return this.findAdminById(id);
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    async update(id: string, dto: UpdateProjectDto): Promise<Project> {
        const current = await this.findAdminById(id);
        const next = {
            title: dto.title ?? current.title,
            slug: dto.slug ?? current.slug,
            summary: dto.summary ?? current.summary,
            contentMarkdown: dto.contentMarkdown ?? current.contentMarkdown,
            status: dto.status ?? current.status,
            category:
                dto.category === undefined ? current.category : dto.category,
            coverUrl:
                dto.coverUrl === undefined ? current.coverUrl : dto.coverUrl,
            githubRepositoryUrl:
                dto.githubRepositoryUrl === undefined
                    ? current.githubRepositoryUrl
                    : dto.githubRepositoryUrl,
            featured: dto.featured ?? current.featured,
            published: dto.published ?? current.published,
            startedAt:
                dto.startedAt === undefined ? current.startedAt : dto.startedAt,
            endedAt: dto.endedAt === undefined ? current.endedAt : dto.endedAt,
            tags: dto.tags ?? current.tags,
            links: dto.links ?? current.links,
        };

        try {
            await this.database.transaction(async (client) => {
                await client.query(projectsSql.update, [
                    id,
                    next.title,
                    next.slug,
                    next.summary,
                    next.contentMarkdown,
                    next.status,
                    next.category,
                    next.coverUrl,
                    next.githubRepositoryUrl,
                    next.featured,
                    next.published,
                    next.startedAt,
                    next.endedAt,
                ]);
                await this.replaceRelations(client, id, next.tags, next.links);
            });

            return this.findAdminById(id);
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.database.query(projectsSql.delete, [id]);
        if (!result.rowCount) {
            throw new NotFoundException('Projet introuvable.');
        }
    }

    private async replaceRelations(
        client: DatabaseClient,
        projectId: string,
        tags: ProjectTagDto[],
        links: ProjectLinkDto[],
    ): Promise<void> {
        await client.query(projectsSql.clearTags, [projectId]);

        const uniqueTags = [
            ...new Map(tags.map((tag) => [tag.slug, tag])).values(),
        ];
        for (const tag of uniqueTags) {
            const result = await client.query<{ id: string }>(
                projectsSql.upsertTag,
                [tag.name, tag.slug],
            );
            await client.query(projectsSql.attachTag, [
                projectId,
                result.rows[0].id,
            ]);
        }

        await client.query(projectsSql.clearLinks, [projectId]);
        for (const link of links) {
            await client.query(projectsSql.addLink, [
                projectId,
                link.label,
                link.url,
                link.type ?? null,
            ]);
        }
    }

    private requireProject(project?: Project): Project {
        if (!project) {
            throw new NotFoundException('Projet introuvable.');
        }
        return project;
    }

    private rethrowDatabaseError(error: unknown): never {
        if ((error as { code?: string }).code === '23505') {
            throw new ConflictException('Ce slug est déjà utilisé.');
        }
        throw error;
    }
}
