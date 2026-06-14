import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ProjectTagDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;
}

export class ProjectLinkDto {
  @IsString()
  @MaxLength(120)
  label: string;

  @IsUrl({ require_protocol: true })
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string | null;
}

export class CreateProjectDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(220)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsString()
  @MaxLength(600)
  summary: string;

  @IsOptional()
  @IsString()
  contentMarkdown?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  coverUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  githubRepositoryUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsDateString()
  startedAt?: string | null;

  @IsOptional()
  @IsDateString()
  endedAt?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectTagDto)
  tags?: ProjectTagDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  links?: ProjectLinkDto[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
