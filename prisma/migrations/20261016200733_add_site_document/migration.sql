-- CreateTable
CREATE TABLE "site_document" (
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_document_pkey" PRIMARY KEY ("key")
);
