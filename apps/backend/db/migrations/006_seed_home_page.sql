WITH home_content(cell, value) AS (
  VALUES
    ('eyebrow', 'Développeur et Tech lead'),
    (
      'title',
      'Je participe à la création d''outils informatiques aidant différents corps de métiers dans leurs tâches quotidienne'
    ),
    (
      'introduction',
      'Ce site rassemble mes projets persos, mes notes de travail et quelques idées encore en train de prendre forme.'
    ),
    ('linkLabel', 'Voir les projets →'),
    ('sectionEyebrow', 'Sélection'),
    ('sectionTitle', 'Travaux récents'),
    ('emptyMessage', 'Les premiers projets arrivent bientôt.')
),
inserted_current AS (
  INSERT INTO page_content_current (
    page_name, page_version, cell, value, updated_at
  )
  SELECT 'home', 1, cell, value, now()
  FROM home_content
  WHERE NOT EXISTS (
    SELECT 1
    FROM page_content_current
    WHERE page_name = 'home'
  )
  RETURNING page_name, page_version, cell, value, updated_at
)
INSERT INTO page_content_history (
  page_name, page_version, cell, value, updated_at
)
SELECT page_name, page_version, cell, value, updated_at
FROM inserted_current;
