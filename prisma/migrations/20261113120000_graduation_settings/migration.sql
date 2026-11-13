-- CreateTable
CREATE TABLE "GraduationSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationSettings_pkey" PRIMARY KEY ("id")
);

