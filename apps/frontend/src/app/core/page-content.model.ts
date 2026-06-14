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

export type HomePagePayload = Pick<
  HomePage,
  | 'eyebrow'
  | 'title'
  | 'introduction'
  | 'linkLabel'
  | 'sectionEyebrow'
  | 'sectionTitle'
  | 'emptyMessage'
>;

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
