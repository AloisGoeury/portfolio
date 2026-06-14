const PAGE_FIELDS = `
  page_name AS "pageName",
  page_version AS version,
  MAX(updated_at) AS "updatedAt",
  json_object_agg(cell, value ORDER BY cell) AS cells
`;

export const pagesSql = {
  findCurrent: `
    SELECT ${PAGE_FIELDS}
    FROM page_content_current
    WHERE page_name = $1
    GROUP BY page_name, page_version
  `,
  listHistory: `
    SELECT ${PAGE_FIELDS}
    FROM page_content_history
    WHERE page_name = $1
    GROUP BY page_name, page_version
    ORDER BY page_version DESC
  `,
  lockPage: 'SELECT pg_advisory_xact_lock(hashtext($1))',
  findCurrentVersion: `
    SELECT COALESCE(MAX(page_version), 0)::integer AS version
    FROM page_content_current
    WHERE page_name = $1
  `,
  clearCurrent: 'DELETE FROM page_content_current WHERE page_name = $1',
  insertCurrent: `
    INSERT INTO page_content_current (
      page_name, page_version, cell, value, updated_at
    )
    VALUES ($1, $2, $3, $4, $5)
  `,
  insertHistory: `
    INSERT INTO page_content_history (
      page_name, page_version, cell, value, updated_at
    )
    VALUES ($1, $2, $3, $4, $5)
  `,
} as const;
