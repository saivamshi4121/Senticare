/*
  Seed a few demo patients for local development.
  Usage: npm run seed:patients
*/

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const Patient = require('../models/Patient');

async function run() {
  try {
    await connectDB();

    const countBefore = await Patient.countDocuments();

    const demoPatients = [
      {
        patientId: `PAT-${String(countBefore + 1).padStart(6, '0')}`,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1982-05-15'),
        gender: 'Male',
        contactInfo: { phone: '+15551234567', email: 'john.doe@example.com' },
        roomInfo: { roomNumber: 'ICU-01', status: 'Active' },
        medicalInfo: { bloodType: 'O+' },
        vitalSigns: [
          {
            timestamp: new Date(),
            temperature: 37.2,
            bloodPressure: { systolic: 118, diastolic: 76 },
            heartRate: 78,
            respiratoryRate: 16,
            oxygenSaturation: 97,
          },
        ],
      },
      {
        patientId: `PAT-${String(countBefore + 2).padStart(6, '0')}`,
        firstName: 'Maria',
        lastName: 'Lopez',
        dateOfBirth: new Date('1990-11-02'),
        gender: 'Female',
        contactInfo: { phone: '+15557654321', email: 'maria.lopez@example.com' },
        roomInfo: { roomNumber: 'WARD-12', status: 'Active' },
        medicalInfo: { bloodType: 'A+' },
        vitalSigns: [
          {
            timestamp: new Date(),
            temperature: 38.6,
            bloodPressure: { systolic: 135, diastolic: 88 },
            heartRate: 104,
            respiratoryRate: 20,
            oxygenSaturation: 93,
          },
        ],
      },
    ];

    await Patient.insertMany(demoPatients);

    const total = await Patient.countDocuments();
    console.log(`Seeded patients. Total patients: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed patients failed:', err?.message || err);
    process.exit(1);
  }
}

run();


