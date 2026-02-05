#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connectivity to the database and provides diagnostic information
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testing database connection...\n');
  console.log('Connection URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
  console.log('');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database query successful!');
    console.log('📊 Database version:', result[0]?.version || 'Unknown');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`\n📋 Found ${tables.length} tables in database`);
    
    await prisma.$disconnect();
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('\nError details:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n🔧 Troubleshooting steps:');
      console.error('1. Check if the RDS instance is running in AWS Console');
      console.error('2. Verify your IP is allowed in the RDS Security Group');
      console.error('3. Check if you need VPN/bastion access');
      console.error('4. Verify the DATABASE_URL in your .env file');
      console.error('5. Test network connectivity:');
      console.error('   nc -zv aides-t2d-db.c670ea008495.us-east-1.rds.amazonaws.com 5432');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();
