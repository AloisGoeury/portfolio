export interface ProjectTag {
  id?: string;
  name: string;
  slug: string;
}

export interface ProjectLink {
  id?: string;
  label: string;
  url: string;
  type?: string | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  status: string;
  category: string | null;
  coverUrl: string | null;
  featured: boolean;
  published: boolean;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ProjectTag[];
  links: ProjectLink[];
}

export type ProjectPayload = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
