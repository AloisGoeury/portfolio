export interface Note {
  id: string;
  projectId: string | null;
  projectTitle: string | null;
  projectSlug: string | null;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotePayload = Omit<
  Note,
  | 'id'
  | 'projectTitle'
  | 'projectSlug'
  | 'publishedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export interface QueuedProjectUpdate {
  id: string;
  projectId: string;
  projectTitle: string;
  projectSlug: string;
  commitSha: string;
  commitUrl: string;
  commitMessage: string;
  committedAt: string;
  authorName: string | null;
  proposedTitle: string;
  proposedContentMarkdown: string;
  status: 'pending' | 'published' | 'ignored';
  noteId: string | null;
  createdAt: string;
  updatedAt: string;
}
