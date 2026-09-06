const mongoose = require('mongoose');

const introSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  greeting: { type: String, default: '你好' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' }
}, { _id: false });

const educationSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  period: { type: String, default: '' },
  school: { type: String, default: '' },
  desc: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  period: { type: String, default: '' },
  company: { type: String, default: '' },
  desc: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: false });

const skillsSchema = new mongoose.Schema({
  technical: { type: [String], default: [] },
  soft: { type: [String], default: [] }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  type: { type: String, enum: ['phone', 'email', 'github', 'wechat', 'twitter', 'link', 'weibo'], default: 'link' },
  label: { type: String, default: '' },
  value: { type: String, default: '' },
  url: { type: String, default: '' }
}, { _id: false });

const profileSchema = new mongoose.Schema({
  intro: { type: introSchema, default: () => ({}) },
  education: { type: [educationSchema], default: [] },
  experiences: { type: [experienceSchema], default: [] },
  skills: { type: skillsSchema, default: () => ({}) },
  contacts: { type: [contactSchema], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
