const NOTE_FIELDS = `
  n.id,
  n.project_id AS "projectId",
  p.title AS "projectTitle",
  p.slug AS "projectSlug",
  n.title,
  n.slug,
  n.excerpt,
  n.content_markdown AS "contentMarkdown",
  n.published,
  n.published_at AS "publishedAt",
  n.created_at AS "createdAt",
  n.updated_at AS "updatedAt"
`;

const QUEUE_FIELDS = `
  q.id,
  q.project_id AS "projectId",
  p.title AS "projectTitle",
  p.slug AS "projectSlug",
  q.commit_sha AS "commitSha",
  q.commit_url AS "commitUrl",
  q.commit_message AS "commitMessage",
  q.committed_at AS "committedAt",
  q.author_name AS "authorName",
  q.proposed_title AS "proposedTitle",
  q.proposed_content_markdown AS "proposedContentMarkdown",
  q.status,
  q.note_id AS "noteId",
  q.created_at AS "createdAt",
  q.updated_at AS "updatedAt"
`;

export const notesSql = {
  listPublished: `
    SELECT ${NOTE_FIELDS}
    FROM notes n
    LEFT JOIN projects p ON p.id = n.project_id
    WHERE n.published = true
    ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC
  `,
  listAdmin: `
    SELECT ${NOTE_FIELDS}
    FROM notes n
    LEFT JOIN projects p ON p.id = n.project_id
    ORDER BY n.updated_at DESC
  `,
  findAdminById: `
    SELECT ${NOTE_FIELDS}
    FROM notes n
    LEFT JOIN projects p ON p.id = n.project_id
    WHERE n.id = $1
  `,
  create: `
    INSERT INTO notes (
      project_id, title, slug, excerpt, content_markdown, published, published_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $6 THEN now() ELSE NULL END)
    RETURNING id
  `,
  update: `
    UPDATE notes
    SET project_id = $2,
        title = $3,
        slug = $4,
        excerpt = $5,
        content_markdown = $6,
        published = $7,
        published_at = CASE
          WHEN $7 AND published_at IS NULL THEN now()
          WHEN NOT $7 THEN NULL
          ELSE published_at
        END,
        updated_at = now()
    WHERE id = $1
  `,
  delete: 'DELETE FROM notes WHERE id = $1',
  findProjectForUpdate: `
    SELECT id, title, slug, github_repository_url AS "githubRepositoryUrl"
    FROM projects
    WHERE slug = $1
  `,
  updateLastCommit: `
    UPDATE projects
    SET last_commit_sha = $2,
        last_commit_url = $3,
        last_commit_message = $4,
        last_commit_at = $5,
        updated_at = now()
    WHERE id = $1
      AND (last_commit_at IS NULL OR last_commit_at <= $5)
  `,
  enqueueProjectUpdate: `
    INSERT INTO project_update_queue (
      project_id, commit_sha, commit_url, commit_message, committed_at,
      author_name, proposed_title, proposed_content_markdown
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (project_id, commit_sha) DO UPDATE
    SET commit_url = EXCLUDED.commit_url,
        commit_message = EXCLUDED.commit_message,
        committed_at = EXCLUDED.committed_at,
        author_name = EXCLUDED.author_name,
        updated_at = now()
    RETURNING id
  `,
  listQueue: `
    SELECT ${QUEUE_FIELDS}
    FROM project_update_queue q
    JOIN projects p ON p.id = q.project_id
    ORDER BY
      CASE q.status WHEN 'pending' THEN 0 WHEN 'published' THEN 1 ELSE 2 END,
      q.committed_at DESC
  `,
  findQueueById: `
    SELECT ${QUEUE_FIELDS}
    FROM project_update_queue q
    JOIN projects p ON p.id = q.project_id
    WHERE q.id = $1
  `,
  updateQueueDraft: `
    UPDATE project_update_queue
    SET proposed_title = $2,
        proposed_content_markdown = $3,
        updated_at = now()
    WHERE id = $1 AND status = 'pending'
  `,
  ignoreQueueItem: `
    UPDATE project_update_queue
    SET status = 'ignored', updated_at = now()
    WHERE id = $1 AND status = 'pending'
  `,
  createNoteFromQueue: `
    INSERT INTO notes (
      project_id, title, slug, excerpt, content_markdown, published, published_at
    )
    SELECT
      project_id, proposed_title, $2, $3, proposed_content_markdown, $4,
      CASE WHEN $4 THEN now() ELSE NULL END
    FROM project_update_queue
    WHERE id = $1 AND status = 'pending'
    RETURNING id
  `,
  markQueuePublished: `
    UPDATE project_update_queue
    SET status = 'published', note_id = $2, updated_at = now()
    WHERE id = $1
  `,
} as const;
