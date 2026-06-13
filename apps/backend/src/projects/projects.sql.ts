const PROJECT_FIELDS = `
  p.id,
  p.title,
  p.slug,
  p.summary,
  p.content_markdown AS "contentMarkdown",
  p.status,
  p.category,
  p.cover_url AS "coverUrl",
  p.featured,
  p.published,
  to_char(p.started_at, 'YYYY-MM-DD') AS "startedAt",
  to_char(p.ended_at, 'YYYY-MM-DD') AS "endedAt",
  p.created_at AS "createdAt",
  p.updated_at AS "updatedAt",
  COALESCE(
    (
      SELECT json_agg(
        json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
        ORDER BY t.name
      )
      FROM project_tags pt
      JOIN tags t ON t.id = pt.tag_id
      WHERE pt.project_id = p.id
    ),
    '[]'::json
  ) AS tags,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', pl.id,
          'label', pl.label,
          'url', pl.url,
          'type', pl.type
        )
        ORDER BY pl.label
      )
      FROM project_links pl
      WHERE pl.project_id = p.id
    ),
    '[]'::json
  ) AS links
`;

export const projectsSql = {
  listPublished: `
    SELECT ${PROJECT_FIELDS}
    FROM projects p
    WHERE p.published = true
    ORDER BY p.featured DESC, COALESCE(p.ended_at, p.started_at) DESC NULLS LAST,
      p.created_at DESC
  `,
  findPublishedBySlug: `
    SELECT ${PROJECT_FIELDS}
    FROM projects p
    WHERE p.slug = $1 AND p.published = true
  `,
  listAdmin: `
    SELECT ${PROJECT_FIELDS}
    FROM projects p
    ORDER BY p.updated_at DESC
  `,
  findAdminById: `
    SELECT ${PROJECT_FIELDS}
    FROM projects p
    WHERE p.id = $1
  `,
  create: `
    INSERT INTO projects (
      title, slug, summary, content_markdown, status, category, cover_url,
      featured, published, started_at, ended_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `,
  update: `
    UPDATE projects
    SET title = $2,
        slug = $3,
        summary = $4,
        content_markdown = $5,
        status = $6,
        category = $7,
        cover_url = $8,
        featured = $9,
        published = $10,
        started_at = $11,
        ended_at = $12,
        updated_at = now()
    WHERE id = $1
  `,
  delete: 'DELETE FROM projects WHERE id = $1',
  clearTags: 'DELETE FROM project_tags WHERE project_id = $1',
  upsertTag: `
    INSERT INTO tags (name, slug)
    VALUES ($1, $2)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `,
  attachTag: `
    INSERT INTO project_tags (project_id, tag_id)
    VALUES ($1, $2)
  `,
  clearLinks: 'DELETE FROM project_links WHERE project_id = $1',
  addLink: `
    INSERT INTO project_links (project_id, label, url, type)
    VALUES ($1, $2, $3, $4)
  `,
} as const;
