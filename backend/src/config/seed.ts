// dotenv loads your .env file into process.env
// must be called before anything reads process.env
import 'dotenv/config';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { Author } from '../models/Author.model.js';
import { User } from '../models/User.model.js';
import connectDB from './db.js';

// In ESM (type: module), __dirname does not exist like it does in CommonJS
// This is one of the key differences you'll hit with ESM in Node
// We reconstruct it manually using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON file from wherever you placed it
// Adjust the path if your JSON file is in a different location
const rawData = readFileSync(
  join(__dirname, '../../bookleaf_sample_data.json'),
  'utf-8'
);

// Parse JSON string into a JS object
const seedData = JSON.parse(rawData);

const seed = async (): Promise<void> => {
  await connectDB();

  // Wipe existing data so seed is idempotent
  // (running seed twice won't create duplicates)
  console.log('Clearing existing data...');
  await Author.deleteMany({});
  await User.deleteMany({});

  // ── SEED AUTHORS ──────────────────────────────────────────────
  console.log('Seeding authors...');
  await Author.insertMany(seedData.authors);
  console.log(`✓ ${seedData.authors.length} authors inserted`);

  // ── SEED USERS ────────────────────────────────────────────────
  // Each author gets a user account so they can log in
  // Password is hashed here manually because insertMany bypasses
  // the pre('save') hook we defined on the User model
  console.log('Seeding users...');

  const authorUsers = await Promise.all(
    seedData.authors.map(async (author: { author_id: string; email: string }) => ({
      email: author.email,
      // Hash password manually — insertMany skips mongoose middleware
      password: await bcrypt.hash('password123', 12),
      role: 'author' as const,
      author_id: author.author_id,
    }))
  );

  // Admin account — separate from authors
  const adminUser = {
    email: 'admin@bookleaf.com',
    password: await bcrypt.hash('admin123', 12),
    role: 'admin' as const,
    author_id: null,
  };

  await User.insertMany([...authorUsers, adminUser]);
  console.log(`✓ ${authorUsers.length} author users + 1 admin user inserted`);

  // ── PRINT TEST CREDENTIALS ────────────────────────────────────
  console.log('\n── Test Credentials ──────────────────────');
  console.log('Admin:  admin@bookleaf.com  /  admin123');
  console.log('Author: priya.sharma@email.com  /  password123');
  console.log('Author: rohit.kapoor@email.com  /  password123');
  console.log('──────────────────────────────────────────\n');

  // Close DB connection after seeding is done
  await mongoose.connection.close();
  console.log('Seeding complete. Connection closed.');
};

// Run the seed function
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

/*

The seed function here populates the MongoDB with the sample dataset provided in the assignment. 

The app needs initial data to be testable. Authors need user accounts to log in, and the JSON data doesn't include passwords - the seed generates those. 

 */