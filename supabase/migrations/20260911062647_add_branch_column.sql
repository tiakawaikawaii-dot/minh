ALTER TABLE chats ADD COLUMN IF NOT EXISTS branch_from_id uuid REFERENCES chats(id) ON DELETE SET NULL;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS branch_from_message_id uuid;
