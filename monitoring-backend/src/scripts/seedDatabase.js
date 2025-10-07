/*
  Seed script to create a default Admin user for local development/testing.
  Usage: npm run seed
*/

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  try {
    await connectDB();

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@senticare.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin already exists:', adminEmail);
      console.log(`You can log in with:\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
      process.exit(0);
    }

    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: adminPassword,
      role: 'Admin',
      department: 'IT',
      employeeId: 'EMP-000001',
      contactInfo: { phone: '+1234567890' },
      emailVerified: true,
      isActive: true,
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Login credentials ->');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err?.message || err);
    process.exit(1);
  }
}

run();


