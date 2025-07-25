// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String           @id @default(uuid())
  email            String           @unique
  password         String?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  sleepEntries     SleepEntry[]
  name             String
  emailVerified    Boolean
  image            String?
  sessions         Session[]
  accounts         Account[]

  @@map("user")
}

model SleepEntry {
  id              String    @id @default(uuid())
  userId          String // Foreign key to User
  user            User      @relation(fields: [userId], references: [id])
  bedtime         DateTime
  wakeUpTime      DateTime
  durationHours   Float     // Store duration in hours for easier charting
  qualityRating   Int       @map("sleep_quality_rating") @default(5) @db.SmallInt // 1-10
  entryDate       DateTime  @unique @default(now()) 
  dayRating       Int       @map("day_rating") @default(5) @db.SmallInt // 1-10
  mood            Mood?     
  sleepcomments   String?
  daycomments     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Maps this model to a table named 'sleep_entries' in the DB
  @@map("sleep_entries")
}


enum Mood {
  Happy
  Stressed
  Neutral
  Sad
  Excited
  Tired
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}
