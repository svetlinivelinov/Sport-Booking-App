INSERT INTO "sports" (
  "id",
  "slug",
  "name",
  "team_size",
  "scoring_model",
  "ranking_model",
  "scheduling_strategy",
  "rules_config"
)
SELECT
  '7a9ff94b-4f06-4b64-a7f2-34f8e2059d01',
  'tennis',
  'Tennis',
  1,
  'sets',
  'wins_then_diff',
  'round_robin',
  '{"bestOfSets":3,"maxParticipants":4}'::jsonb
WHERE NOT EXISTS (
  SELECT 1
  FROM "sports"
  WHERE "slug" = 'tennis'
);

UPDATE "sports"
SET "rules_config" = jsonb_set(
  COALESCE("rules_config", '{}'::jsonb),
  '{maxParticipants}',
  '22'::jsonb,
  true
)
WHERE "slug" = 'football';

UPDATE "sports"
SET "rules_config" = jsonb_set(
  COALESCE("rules_config", '{}'::jsonb),
  '{maxParticipants}',
  '4'::jsonb,
  true
)
WHERE "slug" = 'tennis';
