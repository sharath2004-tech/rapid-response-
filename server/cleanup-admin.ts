import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || '';

async function cleanupAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find ALL users with admin email
    const allAdmins = await mongoose.connection.db.collection('users').find({ 
      email: 'admin@rapidresponse.com' 
    }).toArray();
    
    console.log(`\n📋 Found ${allAdmins.length} user(s) with email admin@rapidresponse.com:`);
    allAdmins.forEach((admin, index) => {
      console.log(`\n   User ${index + 1}:`);
      console.log(`   - ID: ${admin._id}`);
      console.log(`   - Name: ${admin.name}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - Has password: ${!!admin.password}`);
    });

    // Delete ALL users with admin email
    const deleteResult = await mongoose.connection.db.collection('users').deleteMany({ 
      email: 'admin@rapidresponse.com' 
    });
    console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} user(s)`);

    // Create fresh admin with correct role
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    const result = await mongoose.connection.db.collection('users').insertOne({
      name: 'System Admin',
      email: 'admin@rapidresponse.com',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n✅ NEW admin created!');
    console.log('   ID:', result.insertedId);
    console.log('   Email: admin@rapidresponse.com');
    console.log('   Password: Admin@123');
    console.log('   Role: admin');

    // Verify the new admin
    const newAdmin = await mongoose.connection.db.collection('users').findOne({ 
      email: 'admin@rapidresponse.com' 
    });
    
    if (newAdmin) {
      const isValid = await bcrypt.compare('Admin@123', newAdmin.password);
      console.log('\n🔐 Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
      console.log('   Role verification:', newAdmin.role === 'admin' ? '✅ ADMIN' : '❌ NOT ADMIN');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupAdmin();
