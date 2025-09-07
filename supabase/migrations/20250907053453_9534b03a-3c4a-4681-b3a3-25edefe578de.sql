-- Add missing action types to the audit log enum
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'resubmit';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'update';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'submit';