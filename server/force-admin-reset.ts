import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Use the EXACT production MongoDB URI from Render
const MONGODB_URI = 'mongodb+srv://2004sharath:LCjk7u6ZQYcuPHJl@cluster0.15o2inv.mongodb.net/?appName=Cluster0';

async function forceResetAdmin() {
  try {
    console.log('Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Find ALL users with admin email (case insensitive)
    const allUsers = await db.collection('users').find({ 
      email: { $regex: /^admin@rapidresponse\.com$/i }
    }).toArray();
    
    console.log(`\n📋 Found ${allUsers.length} user(s) with admin email:`);
    allUsers.forEach((user, index) => {
      console.log(`\n   User ${index + 1}:`);
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Role: ${user.role}`);
    });

    // Delete ALL admin users
    const deleteResult = await db.collection('users').deleteMany({ 
      email: { $regex: /^admin@rapidresponse\.com$/i }
    });
    console.log(`\n🗑️  DELETED ${deleteResult.deletedCount} user(s)`);

    // Create fresh admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    const newAdmin = {
      name: 'System Admin',
      email: 'admin@rapidresponse.com',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newAdmin);
    console.log('\n✅ NEW admin created!');
    console.log('   ID:', result.insertedId);
    console.log('   Email: admin@rapidresponse.com');
    console.log('   Password: Admin@123');
    console.log('   Role: admin');

    // Verify
    const verify = await db.collection('users').findOne({ _id: result.insertedId });
    if (verify) {
      const isValid = await bcrypt.compare('Admin@123', verify.password);
      console.log('\n🔐 Verification:');
      console.log('   Password works:', isValid ? '✅ YES' : '❌ NO');
      console.log('   Role is admin:', verify.role === 'admin' ? '✅ YES' : '❌ NO');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! Try logging in now.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

forceResetAdmin();
