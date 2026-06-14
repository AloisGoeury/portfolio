import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateAboutPageDto, UpdateHomePageDto } from './pages.dto';
import { AboutPage, HomePage, PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('home')
  findHome(): Promise<HomePage> {
    return this.pagesService.findHome();
  }

  @Get('about')
  findAbout(): Promise<AboutPage> {
    return this.pagesService.findAbout();
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/pages')
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('home')
  findHome(): Promise<HomePage> {
    return this.pagesService.findHome();
  }

  @Get('home/history')
  listHomeHistory(): Promise<HomePage[]> {
    return this.pagesService.listHomeHistory();
  }

  @Patch('home')
  updateHome(@Body() dto: UpdateHomePageDto): Promise<HomePage> {
    return this.pagesService.updateHome(dto);
  }

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
