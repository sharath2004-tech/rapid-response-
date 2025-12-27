import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || '';

async function resetAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI ? 'SET' : 'NOT SET');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await mongoose.connection.db.collection('users').deleteOne({ email: 'admin@rapidresponse.com' });
    console.log('🗑️  Deleted existing admin (if any)');

    // Create new admin with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    const result = await mongoose.connection.db.collection('users').insertOne({
      name: 'System Admin',
      email: 'admin@rapidresponse.com',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ New admin created!');
    console.log('   ID:', result.insertedId);
    console.log('   Email: admin@rapidresponse.com');
    console.log('   Password: Admin@123');

    // Verify the password works
    const admin = await mongoose.connection.db.collection('users').findOne({ email: 'admin@rapidresponse.com' });
    if (admin) {
      const isValid = await bcrypt.compare('Admin@123', admin.password);
      console.log('   Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdmin();
