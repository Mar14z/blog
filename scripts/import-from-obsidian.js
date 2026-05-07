const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const OBSIDIAN_VAULT_PATH = path.join(__dirname, '..', 'obsidian-vault');
const ARTICLE_MODEL_PATH = path.join(__dirname, '../server/models/Article.js');

async function parseObsidianNote(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    let frontmatter = {};
    let markdown = content;
    
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const frontmatterStr = frontmatterMatch[1];
        markdown = content.substring(frontmatterMatch[0].length).trim();
        
        frontmatterStr.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
                }
                
                frontmatter[key] = value;
            }
        });
    }
    
    const title = frontmatter.title || 
                  markdown.match(/^#\s+(.+)$/m)?.[1] || 
                  path.basename(filePath, '.md');
    
    const excerpt = frontmatter.description || 
                   frontmatter.excerpt || 
                   markdown.substring(0, 200).replace(/[#*`]/g, '').trim() + '...';
    
    let category = frontmatter.category || '随笔';
    const allowedCategories = ['设计', '技术', '生活', '随笔', '编程', '产品', '读书', '其他'];
    if (!allowedCategories.includes(category)) {
        category = '其他';
    }
    
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : 
                  (frontmatter.tags ? [frontmatter.tags] : []);
    
    const slug = frontmatter.slug || 
                 title.toLowerCase()
                     .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                     .replace(/^-+|-+$/g, '');
    
    const blogContent = markdown
        .replace(/^#\s+.+$/m, '')
        .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, text) => text || link)
        .replace(/!\[\[([^\]]+)\]\]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^>\s+/gm, '')
        .replace(/^#+\s+/gm, (match) => match.trim() + ' ')
        .trim();

    return {
        title,
        slug,
        excerpt,
        content: blogContent || markdown,
        category,
        tags,
        coverImage: frontmatter.coverImage || '',
        readTime: Math.max(1, Math.ceil(blogContent.split(/\s+/).length / 200)),
        published: frontmatter.published !== false,
        featured: frontmatter.featured || false,
        fromObsidian: true,
        obsidianPath: filePath
    };
}

async function importFromObsidian() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const Article = require(ARTICLE_MODEL_PATH);
        
        const articlesDir = path.join(OBSIDIAN_VAULT_PATH, '01 - Blog');
        
        try {
            await fs.access(articlesDir);
        } catch {
            console.log('✗ Obsidian vault not found:', articlesDir);
            console.log('Please create the folder: obsidian-vault/01 - Blog');
            process.exit(1);
        }

        const files = await fs.readdir(articlesDir);
        const mdFiles = files.filter(f => f.endsWith('.md') && !f.toLowerCase().startsWith('readme'));
        
        console.log(`Found ${mdFiles.length} markdown files (excluding README)`);
        console.log('');

        let imported = 0;
        let updated = 0;
        let skipped = 0;
        let deleted = 0;
        const currentSlugs = new Set();

        for (const file of mdFiles) {
            const filePath = path.join(articlesDir, file);
            
            try {
                const articleData = await parseObsidianNote(filePath);
                currentSlugs.add(articleData.slug);
                
                const existing = await Article.findOne({ slug: articleData.slug });
                
                if (existing) {
                    await Article.findByIdAndUpdate(existing._id, articleData);
                    console.log(`↻ Updated: ${articleData.title}`);
                    updated++;
                } else {
                    await Article.create(articleData);
                    console.log(`✓ Imported: ${articleData.title}`);
                    imported++;
                }
            } catch (error) {
                console.log(`✗ Error processing ${file}:`, error.message);
                skipped++;
            }
        }

        const deletedArticles = await Article.find({ 
            slug: { $nin: Array.from(currentSlugs) }
        });

        if (deletedArticles.length > 0) {
            console.log('');
            console.log('--- Detected deleted articles ---');
            for (const article of deletedArticles) {
                console.log(`✗ Deleted: ${article.title}`);
                await Article.findByIdAndDelete(article._id);
                deleted++;
            }
        }

        console.log('');
        console.log('================================');
        console.log('  Import Complete!');
        console.log('================================');
        console.log('');
        console.log(`Imported: ${imported}`);
        console.log(`Updated: ${updated}`);
        console.log(`Deleted: ${deleted}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Total processed: ${imported + updated}`);
        console.log('');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Import failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    importFromObsidian();
}

module.exports = { importFromObsidian, parseObsidianNote };
