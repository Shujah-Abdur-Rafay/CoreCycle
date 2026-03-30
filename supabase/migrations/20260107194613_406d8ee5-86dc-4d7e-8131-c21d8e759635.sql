UPDATE user_roles
SET role = 'super_admin', is_approved = true, updated_at = now()
WHERE user_id = 'fcb00bdd-bde8-4988-951f-4f267fb2cea5';