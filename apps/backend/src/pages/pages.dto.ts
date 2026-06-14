import { IsString, MaxLength } from 'class-validator';

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
