import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import { UpdateAboutPageDto, UpdateHomePageDto } from './pages.dto';
import { pagesSql } from './pages.sql';

const HOME_PAGE = 'home';
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

export interface HomePage {
  pageName: string;
  version: number;
  updatedAt: string;
  eyebrow: string;
  title: string;
  introduction: string;
  linkLabel: string;
  sectionEyebrow: string;
  sectionTitle: string;
  emptyMessage: string;
}

@Injectable()
export class PagesService {
  constructor(private readonly database: DatabaseService) {}

  async findHome(): Promise<HomePage> {
    const page = await this.findCurrent(HOME_PAGE);
    return this.toHomePage(page);
  }

  async listHomeHistory(): Promise<HomePage[]> {
    const pages = await this.listHistory(HOME_PAGE);
    return pages.map((page) => this.toHomePage(page));
  }

  async updateHome(dto: UpdateHomePageDto): Promise<HomePage> {
    await this.updatePage(HOME_PAGE, dto);
    return this.findHome();
  }

  async findAbout(): Promise<AboutPage> {
    const page = await this.findCurrent(ABOUT_PAGE);
    return this.toAboutPage(page);
  }

  async listAboutHistory(): Promise<AboutPage[]> {
    const pages = await this.listHistory(ABOUT_PAGE);
    return pages.map((page) => this.toAboutPage(page));
  }

  async updateAbout(dto: UpdateAboutPageDto): Promise<AboutPage> {
    await this.updatePage(ABOUT_PAGE, dto);
    return this.findAbout();
  }

  private async findCurrent(pageName: string): Promise<PageRow> {
    const result = await this.database.query<PageRow>(pagesSql.findCurrent, [
      pageName,
    ]);
    return this.requirePage(result.rows[0]);
  }

  private async listHistory(pageName: string): Promise<PageRow[]> {
    const result = await this.database.query<PageRow>(pagesSql.listHistory, [
      pageName,
    ]);
    return result.rows;
  }

  private async updatePage(pageName: string, dto: object): Promise<void> {
    const cells = Object.entries(dto);
    const updatedAt = new Date();

    await this.database.transaction(async (client) => {
      await client.query(pagesSql.lockPage, [pageName]);
      const versionResult = await client.query<VersionRow>(
        pagesSql.findCurrentVersion,
        [pageName],
      );
      const nextVersion = versionResult.rows[0].version + 1;

      await client.query(pagesSql.clearCurrent, [pageName]);
      for (const [cell, value] of cells) {
        const params = [pageName, nextVersion, cell, value, updatedAt];
        await client.query(pagesSql.insertCurrent, params);
        await client.query(pagesSql.insertHistory, params);
      }
    });
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

  private toHomePage(page: PageRow): HomePage {
    return {
      pageName: page.pageName,
      version: page.version,
      updatedAt: page.updatedAt,
      eyebrow: page.cells['eyebrow'] ?? '',
      title: page.cells['title'] ?? '',
      introduction: page.cells['introduction'] ?? '',
      linkLabel: page.cells['linkLabel'] ?? '',
      sectionEyebrow: page.cells['sectionEyebrow'] ?? '',
      sectionTitle: page.cells['sectionTitle'] ?? '',
      emptyMessage: page.cells['emptyMessage'] ?? '',
    };
  }
}
