/*
  Warnings:

  - Made the column `is_temporary_password` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `must_change_password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "is_temporary_password" SET NOT NULL,
ALTER COLUMN "is_temporary_password" SET DEFAULT false,
ALTER COLUMN "must_change_password" SET NOT NULL,
ALTER COLUMN "must_change_password" SET DEFAULT false;
