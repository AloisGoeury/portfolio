import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  projectId?: string | null;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsString()
  @MaxLength(600)
  excerpt: string;

  @IsString()
  contentMarkdown: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  excerpt?: string;

  @IsOptional()
  @IsString()
  contentMarkdown?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class GithubProjectUpdateDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  projectSlug: string;

  @IsUrl({ require_protocol: true })
  repositoryUrl: string;

  @IsString()
  @MaxLength(100)
  commitSha: string;

  @IsUrl({ require_protocol: true })
  commitUrl: string;

  @IsString()
  @MaxLength(500)
  commitMessage: string;

  @IsDateString()
  committedAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  authorName?: string | null;
}

export class UpdateQueuedProjectUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  proposedTitle?: string;

  @IsOptional()
  @IsString()
  proposedContentMarkdown?: string;
}

export class PublishQueuedProjectUpdateDto {
  @IsString()
  @MaxLength(220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  excerpt?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
