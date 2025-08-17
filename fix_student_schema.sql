-- Fix student schema issues
DO $$
BEGIN
    -- Add missing country column to student_users if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_users' AND column_name = 'country') THEN
        ALTER TABLE student_users ADD COLUMN country varchar DEFAULT '';
        UPDATE student_users SET country = 'Unknown' WHERE country IS NULL OR country = '';
        ALTER TABLE student_users ALTER COLUMN country SET NOT NULL;
    END IF;
    
    RAISE NOTICE 'Student schema fixed successfully';
END $$;