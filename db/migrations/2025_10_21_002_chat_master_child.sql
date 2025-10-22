-- Bridge Logistics: Chat Master-Child relationships
-- MS-01: Master-Child chat system with ACL

-- Chat links (master-child relationships)
CREATE TABLE IF NOT EXISTS chat_link (
  master_chat_id   uuid NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
  child_chat_id    uuid NOT NULL UNIQUE REFERENCES chat(id) ON DELETE CASCADE,
  created_by       uuid NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  created_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (master_chat_id, child_chat_id)
);

-- ACL for master chat visibility
CREATE TABLE IF NOT EXISTS chat_master_acl (
  chat_id          uuid PRIMARY KEY REFERENCES chat(id) ON DELETE CASCADE,
  owner_admin_id   uuid NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  visibility       text NOT NULL DEFAULT 'OWNER_ONLY' 
    CHECK (visibility IN ('OWNER_ONLY','ADMINS_OF_BRANCH')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Shipment labels with QR codes
CREATE TABLE IF NOT EXISTS shipment_label (
  shipment_id      uuid PRIMARY KEY REFERENCES shipment(id) ON DELETE CASCADE,
  code_string      text NOT NULL,        -- BRYYYYMMDD_seq_boxes(CLIENTCODE)
  qr_payload       jsonb NOT NULL,       -- {v:2,type:'CHAT_ACCESS',chat,order,branch,client_code}
  pdf_key          text,                 -- s3 key labels/{shipmentId}/label.pdf
  png_key          text,                 -- s3 key labels/{shipmentId}/label.png
  created_at       timestamptz DEFAULT now()
);

-- Access requests for foreign branch chats
CREATE TABLE IF NOT EXISTS chat_access_request (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id          uuid NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
  requester_id     uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  approved_by      uuid REFERENCES "User"(id) ON DELETE SET NULL,
  approved_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_link_master ON chat_link(master_chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_link_child ON chat_link(child_chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_master_acl_owner ON chat_master_acl(owner_admin_id);
CREATE INDEX IF NOT EXISTS idx_shipment_label_code ON shipment_label(code_string);
CREATE INDEX IF NOT EXISTS idx_chat_access_request_chat ON chat_access_request(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_access_request_requester ON chat_access_request(requester_id);

-- Comments for documentation
COMMENT ON TABLE chat_link IS 'Master-child chat relationships for merge/split functionality';
COMMENT ON TABLE chat_master_acl IS 'Access control for master chats - who can see them';
COMMENT ON TABLE shipment_label IS 'Generated labels and QR codes for shipments';
COMMENT ON TABLE chat_access_request IS 'Requests for access to foreign branch chats via QR';

COMMENT ON COLUMN chat_link.master_chat_id IS 'Parent chat that contains children';
COMMENT ON COLUMN chat_link.child_chat_id IS 'Child chat (unique - can only belong to one master)';
COMMENT ON COLUMN chat_master_acl.visibility IS 'OWNER_ONLY: only creator, ADMINS_OF_BRANCH: all admins in same branch';
COMMENT ON COLUMN shipment_label.code_string IS 'Format: BRYYYYMMDD_seq_boxes(CLIENTCODE)';
COMMENT ON COLUMN shipment_label.qr_payload IS 'QR code payload with chat access info';
