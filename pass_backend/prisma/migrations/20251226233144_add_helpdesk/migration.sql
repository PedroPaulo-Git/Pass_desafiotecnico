/*
  Warnings:

  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "HelpdeskCategory" AS ENUM ('BUG', 'AGENDAMENTO', 'TREINAMENTO', 'PERFORMANCE', 'AJUSTE_MELHORIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "HelpdeskPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "HelpdeskStatus" AS ENUM ('ABERTO', 'EM_ANALISE', 'EM_ANDAMENTO', 'AGUARDANDO_USUARIO', 'RESOLVIDO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "HelpdeskModule" AS ENUM ('AGENDAMENTO', 'TREINAMENTOS', 'FINANCEIRO', 'USUARIOS');

-- CreateEnum
CREATE TYPE "HelpdeskEnvironment" AS ENUM ('WEB', 'MOBILE');

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_ticketId_fkey";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "tickets";

-- CreateTable
CREATE TABLE "helpdesk" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "assignedUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "HelpdeskCategory" NOT NULL,
    "priority" "HelpdeskPriority" NOT NULL DEFAULT 'BAIXA',
    "status" "HelpdeskStatus" NOT NULL DEFAULT 'ABERTO',
    "module" "HelpdeskModule",
    "environment" "HelpdeskEnvironment" NOT NULL DEFAULT 'WEB',
    "bucketPath" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "helpdesk_pkey" PRIMARY KEY ("id")
);
