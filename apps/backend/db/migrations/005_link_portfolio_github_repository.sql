UPDATE projects
SET github_repository_url = 'https://github.com/AloisGoeury/portfolio',
    updated_at = now()
WHERE slug = 'construire-ce-portfolio'
  AND github_repository_url IS DISTINCT FROM
    'https://github.com/AloisGoeury/portfolio';
