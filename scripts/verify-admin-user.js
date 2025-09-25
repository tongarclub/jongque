#!/usr/bin/env node

/**
 * Verify Admin User Script
 * Checks if admin user exists and password is correct in production database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyAdminUser() {
  console.log('🔍 Verifying Admin User in Production Database...\n');

  try {
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@jongque.com'
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('📝 Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@jongque.com',
          name: 'System Admin',
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
          isEmailVerified: true,
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   Email:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('   Role:', adminUser.role);
    console.log('   Verified:', adminUser.isVerified);
    console.log('   Email Verified:', adminUser.isEmailVerified);
    console.log('   Has Password:', !!adminUser.password);
    console.log('');

    // Test password
    if (adminUser.password) {
      const passwordTest = await bcrypt.compare('admin123', adminUser.password);
      console.log('🔐 Password Test Results:');
      console.log('   Password "admin123" matches:', passwordTest ? '✅ YES' : '❌ NO');
      
      if (!passwordTest) {
        console.log('');
        console.log('🔧 Fixing password...');
        const newHashedPassword = await bcrypt.hash('admin123', 12);
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: newHashedPassword }
        });
        console.log('✅ Password updated successfully');
        
        // Test again
        const retestPassword = await bcrypt.compare('admin123', newHashedPassword);
        console.log('   New password test:', retestPassword ? '✅ PASS' : '❌ FAIL');
      }
    } else {
      console.log('❌ No password set for admin user');
      console.log('🔧 Setting password...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password set successfully');
    }

    console.log('');
    console.log('📊 Database Statistics:');
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    console.log('   Total users:', userCount);
    console.log('   Admin users:', adminCount);

  } catch (error) {
    console.error('❌ Error verifying admin user:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

async function testLogin() {
  console.log('\n🧪 Testing Login Process...');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@jongque.com' }
    });
    
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare('admin123', user.password);
      console.log('✅ Login simulation:');
      console.log('   Email found:', !!user);
      console.log('   Password valid:', isPasswordValid);
      console.log('   User role:', user.role);
      console.log('   Account verified:', user.isVerified);
      
      if (isPasswordValid) {
        console.log('🎉 Login should work! Try again on the website.');
      } else {
        console.log('❌ Password mismatch - this is the problem!');
      }
    }
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

verifyAdminUser()
  .then(() => testLogin())
  .catch(console.error);
