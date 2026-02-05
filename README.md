This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

### What Was Done to Fix the Database Connection

The initial issue was a **P1001 error** - Prisma couldn't reach the AWS RDS PostgreSQL database. Here's what was done to resolve it:

1. **Updated Prisma Schema**: Added all database models (Participant, InviteKey, User, Session) to `prisma/schema.prisma` from the existing schema definition.

2. **Verified Connection String**: The `.env` file already had the correct `DATABASE_URL` configured:
   ```
   DATABASE_URL="postgresql://aides_admin:olivieristhebestforever@aides-t2d-db.c670eaa08495.us-east-1.rds.amazonaws.com:5432/aides_t2d?schema=public&sslmode=require"
   ```

3. **Pushed Schema to Database**: Ran `npx prisma db push` to create all the tables in the empty database. This created 4 tables:
   - `Participant`
   - `InviteKey`
   - `User`
   - `Session`

4. **Generated Prisma Client**: The Prisma Client was automatically generated after pushing the schema.

### Verifying the Connection

To verify the database connection works, run:
```bash
npm run db:test
```

This will show:
- ✅ Connection status
- Database version
- Number of tables found

### Database Commands

- `npm run db:test` - Test database connection
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

For more detailed troubleshooting information, see `DATABASE_SETUP.md`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



model User {
  id            String      @id @default(uuid())
  participantId String      @unique
  email         String      @unique
  passwordHash  String
  status        String      @default("active")
  createdAt     DateTime    @default(now())
  sessions      Session[]
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
}



to generate code

node scripts/createInvite.mjs AIDES-TEST-001
# or lock to one email:
node scripts/createInvite.mjs AIDES-TEST-002 you@example.com
