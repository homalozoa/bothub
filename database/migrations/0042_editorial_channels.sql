-- Nullable fields preserve old worker writes. Historical classification is a separate reviewed CLI.
ALTER TABLE analyses ADD COLUMN primary_channel text;
ALTER TABLE analyses ADD COLUMN related_channels text[] NOT NULL DEFAULT '{}';
ALTER TABLE publications ADD COLUMN primary_channel text;
ALTER TABLE publications ADD COLUMN related_channels text[] NOT NULL DEFAULT '{}';
ALTER TABLE sources ADD COLUMN channel_hints text[] NOT NULL DEFAULT '{}';
CREATE INDEX publications_primary_channel_idx ON publications (primary_channel, timeline_at DESC, article_id) WHERE eligible AND visibility = 'public';
CREATE INDEX publications_related_channels_idx ON publications USING gin (related_channels);
