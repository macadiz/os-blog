-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_temporary_password" BOOLEAN,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "must_change_password" BOOLEAN,
ADD COLUMN     "password_changed_at" TIMESTAMP(3),
ADD COLUMN     "password_reset_at" TIMESTAMP(3);

-- Populate default values for existing users
UPDATE "users" SET 
    "is_temporary_password" = false,
    "must_change_password" = false,
    "password_changed_at" = "created_at" -- Set initial password change to creation date
WHERE "is_temporary_password" IS NULL;
