-- CH-01: Media Storage Foundation
-- Базовая схема для хранения медиа-файлов в чатах

CREATE TABLE IF NOT EXISTS chat_file (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id         uuid NOT NULL,
  message_id      uuid,
  uploader_id     uuid NOT NULL,
  kind            text NOT NULL CHECK (kind IN ('image','video','pdf','doc','sheet','audio','other')),
  name            text NOT NULL,
  size_bytes      bigint NOT NULL,
  mime            text NOT NULL,
  sha256          text NOT NULL,
  width           int,  -- для image/video
  height          int,
  duration_ms     int,  -- для video/audio
  meta_json       jsonb DEFAULT '{}', -- exif, pages, etc.
  storage_key     text NOT NULL,         -- s3 key: chats/{chatId}/{fileId}/original
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Индексы для производительности
CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_file_sha ON chat_file(sha256, size_bytes);
CREATE INDEX IF NOT EXISTS ix_chat_file_chat_id ON chat_file(chat_id);
CREATE INDEX IF NOT EXISTS ix_chat_file_message_id ON chat_file(message_id);
CREATE INDEX IF NOT EXISTS ix_chat_file_uploader_id ON chat_file(uploader_id);
CREATE INDEX IF NOT EXISTS ix_chat_file_kind ON chat_file(kind);
CREATE INDEX IF NOT EXISTS ix_chat_file_created_at ON chat_file(created_at);

-- Индекс для поиска по метаданным
CREATE INDEX IF NOT EXISTS ix_chat_file_meta_json ON chat_file USING gin(meta_json);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_chat_file_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_chat_file_updated_at
  BEFORE UPDATE ON chat_file
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_file_updated_at();

-- Аудит для изменений файлов
CREATE TABLE IF NOT EXISTS chat_file_audit (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id         uuid NOT NULL,
  action          text NOT NULL, -- CREATE, UPDATE, DELETE, DOWNLOAD
  actor_id        uuid NOT NULL,
  changes_json    jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_chat_file_audit_file_id ON chat_file_audit(file_id);
CREATE INDEX IF NOT EXISTS ix_chat_file_audit_actor_id ON chat_file_audit(actor_id);
CREATE INDEX IF NOT EXISTS ix_chat_file_audit_created_at ON chat_file_audit(created_at);

-- Функция для аудита
CREATE OR REPLACE FUNCTION audit_chat_file_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO chat_file_audit (file_id, action, actor_id, changes_json)
    VALUES (NEW.id, 'CREATE', NEW.uploader_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO chat_file_audit (file_id, action, actor_id, changes_json)
    VALUES (NEW.id, 'UPDATE', NEW.uploader_id, jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO chat_file_audit (file_id, action, actor_id, changes_json)
    VALUES (OLD.id, 'DELETE', OLD.uploader_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_chat_file_audit
  AFTER INSERT OR UPDATE OR DELETE ON chat_file
  FOR EACH ROW
  EXECUTE FUNCTION audit_chat_file_changes();

-- Комментарии для документации
COMMENT ON TABLE chat_file IS 'Медиа-файлы в чатах с метаданными и дедупликацией';
COMMENT ON COLUMN chat_file.kind IS 'Тип файла: image, video, pdf, doc, sheet, audio, other';
COMMENT ON COLUMN chat_file.sha256 IS 'SHA256 хеш для дедупликации';
COMMENT ON COLUMN chat_file.storage_key IS 'S3 ключ: chats/{chatId}/{fileId}/original';
COMMENT ON COLUMN chat_file.meta_json IS 'Дополнительные метаданные: EXIF, страницы, etc.';
COMMENT ON COLUMN chat_file.width IS 'Ширина для изображений/видео';
COMMENT ON COLUMN chat_file.height IS 'Высота для изображений/видео';
COMMENT ON COLUMN chat_file.duration_ms IS 'Длительность для видео/аудио в миллисекундах';
