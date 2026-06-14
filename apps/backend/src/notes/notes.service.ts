import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import {
    CreateNoteDto,
    GithubProjectUpdateDto,
    PublishQueuedProjectUpdateDto,
    UpdateNoteDto,
    UpdateQueuedProjectUpdateDto,
} from './notes.dto';
import { notesSql } from './notes.sql';

export interface Note extends QueryResultRow {
    id: string;
    projectId: string | null;
    projectTitle: string | null;
    projectSlug: string | null;
    title: string;
    slug: string;
    excerpt: string;
    contentMarkdown: string;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface QueuedProjectUpdate extends QueryResultRow {
    id: string;
    projectId: string;
    projectTitle: string;
    projectSlug: string;
    commitSha: string;
    commitUrl: string;
    commitMessage: string;
    committedAt: string;
    authorName: string | null;
    proposedTitle: string;
    proposedContentMarkdown: string;
    status: 'pending' | 'published' | 'ignored';
    noteId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface LinkedProject extends QueryResultRow {
    id: string;
    title: string;
    slug: string;
    githubRepositoryUrl: string | null;
}

@Injectable()
export class NotesService {
    constructor(private readonly database: DatabaseService) {}

    async listPublished(): Promise<Note[]> {
        return (await this.database.query<Note>(notesSql.listPublished)).rows;
    }

    async listAdmin(): Promise<Note[]> {
        return (await this.database.query<Note>(notesSql.listAdmin)).rows;
    }

    async findAdminById(id: string): Promise<Note> {
        const result = await this.database.query<Note>(notesSql.findAdminById, [
            id,
        ]);
        return this.requireValue(result.rows[0], 'Note introuvable.');
    }

    async create(dto: CreateNoteDto): Promise<Note> {
        try {
            const result = await this.database.query<{ id: string }>(
                notesSql.create,
                [
                    dto.projectId ?? null,
                    dto.title,
                    dto.slug,
                    dto.excerpt,
                    dto.contentMarkdown,
                    dto.published ?? false,
                ],
            );
            return this.findAdminById(result.rows[0].id);
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    async update(id: string, dto: UpdateNoteDto): Promise<Note> {
        const current = await this.findAdminById(id);
        const next = {
            projectId:
                dto.projectId === undefined ? current.projectId : dto.projectId,
            title: dto.title ?? current.title,
            slug: dto.slug ?? current.slug,
            excerpt: dto.excerpt ?? current.excerpt,
            contentMarkdown: dto.contentMarkdown ?? current.contentMarkdown,
            published: dto.published ?? current.published,
        };

        try {
            await this.database.query(notesSql.update, [
                id,
                next.projectId,
                next.title,
                next.slug,
                next.excerpt,
                next.contentMarkdown,
                next.published,
            ]);
            return this.findAdminById(id);
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    async delete(id: string): Promise<void> {
        const result = await this.database.query(notesSql.delete, [id]);
        if (!result.rowCount) {
            throw new NotFoundException('Note introuvable.');
        }
    }

    async receiveGithubUpdate(
        authorization: string | undefined,
        dto: GithubProjectUpdateDto,
    ): Promise<QueuedProjectUpdate> {
        this.requireIntegrationSecret(authorization);
        const projectResult = await this.database.query<LinkedProject>(
            notesSql.findProjectForUpdate,
            [dto.projectSlug],
        );
        const project = this.requireValue(
            projectResult.rows[0],
            'Projet introuvable.',
        );

        if (
            !project.githubRepositoryUrl ||
            this.normalizeRepositoryUrl(project.githubRepositoryUrl) !==
                this.normalizeRepositoryUrl(dto.repositoryUrl)
        ) {
            throw new UnauthorizedException(
                'Ce dépôt GitHub n’est pas lié à ce projet.',
            );
        }

        const title = `Mise à jour de ${project.title}`;
        const author = dto.authorName ? ` par ${dto.authorName}` : '';
        const content = [
            dto.commitMessage,
            '',
            `Commit [${dto.commitSha.slice(0, 7)}](${dto.commitUrl})${author}.`,
        ].join('\n');

        const queueId = await this.database.transaction(async (client) => {
            await client.query(notesSql.updateLastCommit, [
                project.id,
                dto.commitSha,
                dto.commitUrl,
                dto.commitMessage,
                dto.committedAt,
            ]);
            const result = await client.query<{ id: string }>(
                notesSql.enqueueProjectUpdate,
                [
                    project.id,
                    dto.commitSha,
                    dto.commitUrl,
                    dto.commitMessage,
                    dto.committedAt,
                    dto.authorName ?? null,
                    title,
                    content,
                ],
            );
            return result.rows[0].id;
        });

        return this.findQueueById(queueId);
    }

    async listQueue(): Promise<QueuedProjectUpdate[]> {
        return (
            await this.database.query<QueuedProjectUpdate>(notesSql.listQueue)
        ).rows;
    }

    async updateQueueDraft(
        id: string,
        dto: UpdateQueuedProjectUpdateDto,
    ): Promise<QueuedProjectUpdate> {
        const current = await this.findQueueById(id);
        if (current.status !== 'pending') {
            throw new ConflictException(
                'Cette proposition a déjà été traitée.',
            );
        }
        await this.database.query(notesSql.updateQueueDraft, [
            id,
            dto.proposedTitle ?? current.proposedTitle,
            dto.proposedContentMarkdown ?? current.proposedContentMarkdown,
        ]);
        return this.findQueueById(id);
    }

    async ignoreQueueItem(id: string): Promise<QueuedProjectUpdate> {
        const result = await this.database.query(notesSql.ignoreQueueItem, [
            id,
        ]);
        if (!result.rowCount) {
            throw new ConflictException(
                'Cette proposition est introuvable ou déjà traitée.',
            );
        }
        return this.findQueueById(id);
    }

    async publishQueueItem(
        id: string,
        dto: PublishQueuedProjectUpdateDto,
    ): Promise<Note> {
        try {
            const noteId = await this.database.transaction(async (client) => {
                const result = await client.query<{ id: string }>(
                    notesSql.createNoteFromQueue,
                    [id, dto.slug, dto.excerpt ?? '', dto.published ?? false],
                );
                if (!result.rows[0]) {
                    throw new ConflictException(
                        'Cette proposition est introuvable ou déjà traitée.',
                    );
                }
                await client.query(notesSql.markQueuePublished, [
                    id,
                    result.rows[0].id,
                ]);
                return result.rows[0].id;
            });
            return this.findAdminById(noteId);
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    private async findQueueById(id: string): Promise<QueuedProjectUpdate> {
        const result = await this.database.query<QueuedProjectUpdate>(
            notesSql.findQueueById,
            [id],
        );
        return this.requireValue(
            result.rows[0],
            'Proposition de mise à jour introuvable.',
        );
    }

    private requireIntegrationSecret(authorization?: string): void {
        const expected = process.env.GITHUB_UPDATES_SECRET;
        const [type, provided] = authorization?.split(' ') ?? [];
        if (!expected || type !== 'Bearer' || !provided) {
            throw new UnauthorizedException('Secret d’intégration invalide.');
        }

        const expectedBuffer = Buffer.from(expected);
        const providedBuffer = Buffer.from(provided);
        if (
            expectedBuffer.length !== providedBuffer.length ||
            !timingSafeEqual(expectedBuffer, providedBuffer)
        ) {
            throw new UnauthorizedException('Secret d’intégration invalide.');
        }
    }

    private normalizeRepositoryUrl(url: string): string {
        return url
            .trim()
            .toLowerCase()
            .replace(/\.git$/, '')
            .replace(/\/$/, '');
    }

    private requireValue<T>(value: T | undefined, message: string): T {
        if (!value) {
            throw new NotFoundException(message);
        }
        return value;
    }

    private rethrowDatabaseError(error: unknown): never {
        if (error instanceof ConflictException) {
            throw error;
        }
        if ((error as { code?: string }).code === '23505') {
            throw new ConflictException('Ce slug est déjà utilisé.');
        }
        throw error;
    }
}
