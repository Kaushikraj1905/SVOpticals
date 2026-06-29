
/*
# Add Prescription Columns

1. Modified Tables
- `prescriptions` - Added columns for comprehensive prescription management
- Added: `left_eye_va`, `right_eye_va`, `lens_type`, `lens_brand`, `lens_coating`, `prescription_date`, `file_url`
*/

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS left_eye_va text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS right_eye_va text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS lens_type text DEFAULT 'Single Vision';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS lens_brand text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS lens_coating text;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_date date DEFAULT CURRENT_DATE;
