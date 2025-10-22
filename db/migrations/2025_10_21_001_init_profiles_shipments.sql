-- Bridge Logistics: Initial migration for profiles and shipments
-- S20: Data Foundation - normalized DB structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts/Users
CREATE TABLE IF NOT EXISTS account (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           citext UNIQUE NOT NULL,
  role            text NOT NULL CHECK (role IN ('USER','ADMIN','EMPLOYEE','SUPER')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Profiles (common header)
CREATE TABLE IF NOT EXISTS profile (
  id              uuid PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('PERSON','COMPANY')),
  client_code     text,                  -- 3..6 digits, see constraint below
  phone           text,
  country         text,                  -- ISO2
  city            text,
  zip             text,
  address_line1   text,
  address_line2   text,
  lang            text DEFAULT 'ru',
  currency        text DEFAULT 'EUR',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Person profile (физическое лицо)
CREATE TABLE IF NOT EXISTS person_profile (
  profile_id      uuid PRIMARY KEY REFERENCES profile(id) ON DELETE CASCADE,
  first_name      text,
  last_name       text,
  date_of_birth   date,
  passport_no     text,                  -- consider encryption for PII
  national_id     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Company profile (юридическое лицо)
CREATE TABLE IF NOT EXISTS company_profile (
  profile_id      uuid PRIMARY KEY REFERENCES profile(id) ON DELETE CASCADE,
  company_name    text NOT NULL,
  reg_no          text,                  -- ОГРН/reg number
  tax_id          text,                  -- ИНН/VAT
  eori            text,                  -- for EU customs
  bank_name       text,
  iban            text,
  swift           text,
  contact_person  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Company documents
CREATE TABLE IF NOT EXISTS company_document (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      uuid NOT NULL REFERENCES company_profile(profile_id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('CHARTER','EXTRACT','VAT_CERTIFICATE','OTHER')),
  filename        text NOT NULL,
  s3_key          text NOT NULL,
  s3_bucket       text NOT NULL DEFAULT 'erp-uploads',
  file_size       bigint,
  mime_type       text,
  uploaded_at     timestamptz NOT NULL DEFAULT now()
);

-- Shipments (заявки/заказы)
CREATE TABLE IF NOT EXISTS shipment (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  number          text UNIQUE NOT NULL,  -- BRYYYYMMDD_seq_boxes(CODE)
  account_id      uuid NOT NULL REFERENCES account(id) ON DELETE RESTRICT,
  client_code     text NOT NULL,         -- snapshot from profile at creation
  status          text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONFIRMED','PICKUP_SCHEDULED','IN_TRANSIT','DELIVERED','CANCELLED')),
  
  -- Parties (JSON for flexibility)
  sender_data     jsonb NOT NULL,
  receiver_data   jsonb NOT NULL,
  duty_payer      text NOT NULL CHECK (duty_payer IN ('SENDER','RECEIVER','THIRD_PARTY')),
  
  -- Transport
  incoterms       text NOT NULL CHECK (incoterms IN ('EXW','FCA','CPT','CIP','DAP','DPU','DDP')),
  incoterms_city  text NOT NULL,
  service_level   text NOT NULL CHECK (service_level IN ('EXPRESS','STANDARD','ECONOMY')),
  
  -- Time windows
  ready_date      date NOT NULL,
  pickup_start    timestamptz,
  pickup_end      timestamptz,
  delivery_start  timestamptz,
  delivery_end    timestamptz,
  
  -- Insurance
  insurance_required boolean NOT NULL DEFAULT false,
  declared_value     numeric(15,2),
  insurance_currency text(3),
  
  -- Cargo (JSON array)
  cargo_items     jsonb NOT NULL,
  dangerous_goods jsonb NOT NULL DEFAULT '{"is_dangerous": false}',
  
  -- Customs
  customs_data    jsonb NOT NULL,
  
  -- Preferences
  preferred_carrier    text,
  special_instructions text,
  webhook_url         text,
  notification_email  text,
  
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Audit log for all changes
CREATE TABLE IF NOT EXISTS audit_log (
  id              bigserial PRIMARY KEY,
  entity          text NOT NULL,
  entity_id       text NOT NULL,
  action          text NOT NULL CHECK (action IN ('CREATE','UPDATE','DELETE')),
  actor_id        uuid REFERENCES account(id),
  old_values      jsonb,
  new_values      jsonb,
  diff_json       jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Constraints and indexes

-- Client code constraint (3-6 digits only)
ALTER TABLE profile
  ADD CONSTRAINT chk_client_code_digits
  CHECK (client_code IS NULL OR (client_code ~ '^[0-9]{3,6}$'));

-- Unique client code per tenant (if multi-tenant, add tenant_id)
CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_client_code 
  ON profile(client_code) 
  WHERE client_code IS NOT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_account_id ON profile(id);
CREATE INDEX IF NOT EXISTS idx_shipment_account_id ON shipment(account_id);
CREATE INDEX IF NOT EXISTS idx_shipment_status ON shipment(status);
CREATE INDEX IF NOT EXISTS idx_shipment_created_at ON shipment(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Triggers for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (entity, entity_id, action, actor_id, new_values)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'CREATE', NEW.account_id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (entity, entity_id, action, actor_id, old_values, new_values, diff_json)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', NEW.account_id, row_to_json(OLD), row_to_json(NEW), 
            jsonb_diff(row_to_json(OLD), row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (entity, entity_id, action, actor_id, old_values)
    VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', OLD.account_id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER audit_profile_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profile
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_shipment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shipment
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Helper function for JSON diff
CREATE OR REPLACE FUNCTION jsonb_diff(old_json jsonb, new_json jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  key text;
BEGIN
  FOR key IN SELECT jsonb_object_keys(new_json)
  LOOP
    IF old_json ? key THEN
      IF old_json->key IS DISTINCT FROM new_json->key THEN
        result := result || jsonb_build_object(key, jsonb_build_object('old', old_json->key, 'new', new_json->key));
      END IF;
    ELSE
      result := result || jsonb_build_object(key, jsonb_build_object('old', null, 'new', new_json->key));
    END IF;
  END LOOP;
  
  FOR key IN SELECT jsonb_object_keys(old_json)
  LOOP
    IF NOT (new_json ? key) THEN
      result := result || jsonb_build_object(key, jsonb_build_object('old', old_json->key, 'new', null));
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Sequence for shipment numbers (per day)
CREATE TABLE IF NOT EXISTS shipment_sequence (
  date_key text PRIMARY KEY, -- YYYYMMDD format
  next_seq integer NOT NULL DEFAULT 1
);

-- Function to generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number(
  p_date text, -- YYYYMMDD
  p_boxes integer,
  p_client_code text
)
RETURNS text AS $$
DECLARE
  seq_num integer;
  result text;
BEGIN
  -- Get or create sequence for the date
  INSERT INTO shipment_sequence (date_key, next_seq)
  VALUES (p_date, 1)
  ON CONFLICT (date_key) DO UPDATE SET next_seq = shipment_sequence.next_seq + 1
  RETURNING next_seq INTO seq_num;
  
  -- Format: BRYYYYMMDD_seq_boxes(CODE)
  result := 'BR' || p_date || '_' || seq_num || '_' || p_boxes || '(' || p_client_code || ')';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE account IS 'User accounts and authentication';
COMMENT ON TABLE profile IS 'Base profile information (common for person/company)';
COMMENT ON TABLE person_profile IS 'Physical person specific data';
COMMENT ON TABLE company_profile IS 'Legal entity specific data';
COMMENT ON TABLE company_document IS 'Company documents stored in S3';
COMMENT ON TABLE shipment IS 'Shipment requests and orders';
COMMENT ON TABLE audit_log IS 'Audit trail for all entity changes';
COMMENT ON TABLE shipment_sequence IS 'Daily sequence counter for shipment numbers';

COMMENT ON COLUMN profile.client_code IS '3-6 digit client code, unique per tenant';
COMMENT ON COLUMN shipment.client_code IS 'Snapshot of client_code from profile at creation time';
COMMENT ON COLUMN shipment.number IS 'Format: BRYYYYMMDD_seq_boxes(CODE)';
