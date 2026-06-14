import { IsString, MaxLength } from 'class-validator';

export class UpdateHomePageDto {
    @IsString()
    @MaxLength(80)
    eyebrow: string;

    @IsString()
    @MaxLength(250)
    title: string;

    @IsString()
    @MaxLength(1000)
    introduction: string;

    @IsString()
    @MaxLength(120)
    linkLabel: string;

    @IsString()
    @MaxLength(80)
    sectionEyebrow: string;

    @IsString()
    @MaxLength(120)
    sectionTitle: string;

    @IsString()
    @MaxLength(250)
    emptyMessage: string;
}

export class UpdateAboutPageDto {
    @IsString()
    @MaxLength(80)
    eyebrow: string;

    @IsString()
    @MaxLength(250)
    title: string;

    @IsString()
    @MaxLength(10000)
    bodyMarkdown: string;

    @IsString()
    @MaxLength(120)
    linkLabel: string;
}
