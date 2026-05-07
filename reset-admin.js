const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: String
});

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const User = mongoose.model('User', userSchema);
    
    await User.deleteMany({ role: 'admin' });
    console.log('✓ Deleted existing admin users');

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    
    await User.create({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'admin'
    });

    console.log('✓ Admin user created successfully');
    console.log('');
    console.log('================================');
    console.log('  Admin Account Reset Complete!');
    console.log('================================');
    console.log('');
    console.log('Username:', process.env.ADMIN_USERNAME);
    console.log('Password:', process.env.ADMIN_PASSWORD);
    console.log('');
    console.log('You can now login at: http://localhost:3001/admin');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
