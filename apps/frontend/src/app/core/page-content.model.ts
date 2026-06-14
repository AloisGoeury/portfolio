export interface AboutPage {
  pageName: string;
  version: number;
  updatedAt: string;
  eyebrow: string;
  title: string;
  bodyMarkdown: string;
  linkLabel: string;
}

export type AboutPagePayload = Pick<
  AboutPage,
  'eyebrow' | 'title' | 'bodyMarkdown' | 'linkLabel'
>;
