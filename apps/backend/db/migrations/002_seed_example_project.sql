INSERT INTO projects (
  title,
  slug,
  summary,
  content_markdown,
  status,
  category,
  featured,
  published,
  started_at
)
SELECT
  'Construire ce portfolio',
  'construire-ce-portfolio',
  'Un portfolio éditorial Angular et NestJS, pensé pour rester simple à faire évoluer.',
  E'# Construire ce portfolio\n\nCe projet documente la création du site : un frontend Angular, une API NestJS et du SQL écrit à la main.\n\n## Principes\n\n- une interface sobre ;\n- peu de dépendances ;\n- un déploiement Railway en un seul service.',
  'published',
  'Web',
  true,
  true,
  CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM projects);
