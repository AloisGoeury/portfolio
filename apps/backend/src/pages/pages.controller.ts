import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateAboutPageDto } from './pages.dto';
import { AboutPage, PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('about')
  findAbout(): Promise<AboutPage> {
    return this.pagesService.findAbout();
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/pages')
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('about')
  findAbout(): Promise<AboutPage> {
    return this.pagesService.findAbout();
  }

  @Get('about/history')
  listAboutHistory(): Promise<AboutPage[]> {
    return this.pagesService.listAboutHistory();
  }

  @Patch('about')
  updateAbout(@Body() dto: UpdateAboutPageDto): Promise<AboutPage> {
    return this.pagesService.updateAbout(dto);
  }
}
