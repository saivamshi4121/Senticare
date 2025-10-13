/*
  Seed demo staff users (Doctor and Nurse) for assignments.
  Usage: npm run seed:staff
*/

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  try {
    await connectDB();

    const demoUsers = [
      {
        firstName: 'Alice',
        lastName: 'Nguyen',
        email: 'alice.nguyen@senticare.com',
        password: 'Nurse@12345',
        role: 'Nurse',
        department: 'ICU',
        employeeId: 'EMP-100001',
        contactInfo: { phone: '+15550010001' },
      },
      {
        firstName: 'Drake',
        lastName: 'Patel',
        email: 'dr.patel@senticare.com',
        password: 'Doctor@12345',
        role: 'Doctor',
        department: 'Cardiology',
        employeeId: 'EMP-100002',
        contactInfo: { phone: '+15550010002' },
      },
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log('Exists:', u.email);
        continue;
      }
      await new User(u).save();
      console.log('Created:', u.email);
    }

    console.log('Seed staff complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed staff failed:', err?.message || err);
    process.exit(1);
  }
}

run();


