import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const seedDatabase = async () => {
  try {
    // Check if any users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Database is already seeded, do nothing
    }

    console.log('🌱 Database is empty. Seeding initial users...');

    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const userPassword = await bcrypt.hash('password123', saltRounds);

    await User.insertMany([
      { name: 'Admin User', email: 'admin@support.com', passwordHash: adminPassword, role: 'admin' },
      { name: 'Alice Johnson', email: 'alice@example.com', passwordHash: userPassword, role: 'customer' },
      { name: 'Bob Smith', email: 'bob@example.com', passwordHash: userPassword, role: 'customer' }
    ]);

    console.log('✅ Seed users injected successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};