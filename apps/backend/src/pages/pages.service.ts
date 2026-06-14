import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import { UpdateAboutPageDto } from './pages.dto';
import { pagesSql } from './pages.sql';

const ABOUT_PAGE = 'about';

interface PageRow extends QueryResultRow {
  pageName: string;
  version: number;
  updatedAt: string;
  cells: Record<string, string>;
}

interface VersionRow extends QueryResultRow {
  version: number;
}

export interface AboutPage {
  pageName: string;
  version: number;
  updatedAt: string;
  eyebrow: string;
  title: string;
  bodyMarkdown: string;
  linkLabel: string;
}

@Injectable()
export class PagesService {
  constructor(private readonly database: DatabaseService) {}

  async findAbout(): Promise<AboutPage> {
    const result = await this.database.query<PageRow>(pagesSql.findCurrent, [
      ABOUT_PAGE,
    ]);
    return this.toAboutPage(this.requirePage(result.rows[0]));
  }

  async listAboutHistory(): Promise<AboutPage[]> {
    const result = await this.database.query<PageRow>(pagesSql.listHistory, [
      ABOUT_PAGE,
    ]);
    return result.rows.map((row) => this.toAboutPage(row));
  }

  async updateAbout(dto: UpdateAboutPageDto): Promise<AboutPage> {
    const cells = Object.entries(dto);
    const updatedAt = new Date();

    await this.database.transaction(async (client) => {
      await client.query(pagesSql.lockPage, [ABOUT_PAGE]);
      const versionResult = await client.query<VersionRow>(
        pagesSql.findCurrentVersion,
        [ABOUT_PAGE],
      );
      const nextVersion = versionResult.rows[0].version + 1;

      await client.query(pagesSql.clearCurrent, [ABOUT_PAGE]);
      for (const [cell, value] of cells) {
        const params = [ABOUT_PAGE, nextVersion, cell, value, updatedAt];
        await client.query(pagesSql.insertCurrent, params);
        await client.query(pagesSql.insertHistory, params);
      }
    });

    return this.findAbout();
  }

  private requirePage(page?: PageRow): PageRow {
    if (!page) {
      throw new NotFoundException('Page introuvable.');
    }
    return page;
  }

  private toAboutPage(page: PageRow): AboutPage {
    return {
      pageName: page.pageName,
      version: page.version,
      updatedAt: page.updatedAt,
      eyebrow: page.cells['eyebrow'] ?? '',
      title: page.cells['title'] ?? '',
      bodyMarkdown: page.cells['bodyMarkdown'] ?? '',
      linkLabel: page.cells['linkLabel'] ?? '',
    };
  }
}
