const mongoose = require('mongoose');
require('dotenv').config();

const articleSchema = new mongoose.Schema({}, { timestamps: true });

async function refreshArticles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const Article = mongoose.model('Article', articleSchema);
        
        const count = await Article.countDocuments();
        console.log(`Found ${count} articles in database`);
        
        const deleteAll = process.argv.includes('--delete-all');
        
        if (deleteAll) {
            console.log('Deleting all articles...');
            await Article.deleteMany({});
            console.log('✓ All articles deleted');
        } else {
            console.log('');
            console.log('Usage: node refresh-articles.js [--delete-all]');
            console.log('');
            console.log('Options:');
            console.log('  --delete-all    Delete all articles before export');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

refreshArticles();
