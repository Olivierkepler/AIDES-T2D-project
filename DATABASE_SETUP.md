# Database Setup Guide

## Current Issue: P1001 - Can't Reach Database Server

The error indicates that Prisma cannot connect to your AWS RDS PostgreSQL instance.

## Quick Fix: AWS RDS Security Group Configuration

### Step 1: Check RDS Instance Status
1. Go to AWS Console → RDS → Databases
2. Find your instance: `aides-t2d-db`
3. Verify status is **"Available"** (not stopped)

### Step 2: Update Security Group
1. Click on your RDS instance
2. Go to **"Connectivity & security"** tab
3. Click on the **Security Group** link
4. Click **"Edit inbound rules"**
5. Add a new rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: My IP (or your specific IP address)
6. Click **"Save rules"**

### Step 3: Verify Connection String
Ensure your `.env` file has the correct format:

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@aides-t2d-db.c670ea008495.us-east-1.rds.amazonaws.com:5432/aides_t2d?sslmode=require"
```

Replace:
- `USERNAME` with your RDS master username
- `PASSWORD` with your RDS master password
- `aides_t2d` with your actual database name (if different)

### Step 4: Test Connection
```bash
npm run db:test
```

Or test network connectivity:
```bash
nc -zv aides-t2d-db.c670ea008495.us-east-1.rds.amazonaws.com 5432
```

## Alternative: If RDS is in Private Subnet

If your RDS instance is in a private subnet, you'll need one of these:

### Option A: VPN Connection
- Connect to your AWS VPN
- Then run Prisma commands

### Option B: SSH Tunnel via Bastion
```bash
ssh -L 5432:aides-t2d-db.c670ea008495.us-east-1.rds.amazonaws.com:5432 user@bastion-host
```

Then update `.env`:
```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/aides_t2d?sslmode=require"
```

### Option C: AWS Systems Manager Session Manager
Use AWS SSM to create a port forwarding session.

## Local Development Alternative

If you can't access RDS, set up a local PostgreSQL:

1. Install PostgreSQL locally
2. Create database:
   ```bash
   createdb aides_t2d
   ```
3. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/aides_t2d"
   ```
4. Run migrations:
   ```bash
   npm run db:push
   ```

## Commands Reference

- `npm run db:test` - Test database connection
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
