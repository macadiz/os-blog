-- AlterTable
ALTER TABLE "blog_settings" ADD COLUMN     "allow_comments" BOOLEAN;

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_email" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_spam" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "post_id" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");

-- CreateIndex
CREATE INDEX "comments_author_email_idx" ON "comments"("author_email");

-- CreateIndex
CREATE INDEX "comments_author_ip_address_idx" ON "comments"("author_ip_address");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
