require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super Admin already exists:', existingAdmin.email);
      return process.exit(0);
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@emr.com',
      password: 'Admin@123', // will be auto-hashed by the pre-save hook
      role: 'super_admin',
    });

    console.log('Super Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();