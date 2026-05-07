const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const OBSIDIAN_PATH = path.join(__dirname, '..', 'obsidian-vault', '01 - Blog');

console.log('=====================================');
console.log('  Obsidian Auto-Sync Service');
console.log('=====================================');
console.log('');
console.log('Watching for changes in:');
console.log(OBSIDIAN_PATH);
console.log('');
console.log('Press Ctrl+C to stop');
console.log('');

let syncTimeout = null;
let isSyncing = false;

function runImport() {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }
    
    if (isSyncing) {
        console.log('⏳ Sync in progress, waiting...');
        return;
    }
    
    console.log('');
    console.log('📝 Change detected, syncing in 2 seconds...');
    
    syncTimeout = setTimeout(() => {
        isSyncing = true;
        console.log('');
        console.log('🔄 Syncing to blog database...');
        console.log('');
        
        const { spawn } = require('child_process');
        const importProcess = spawn('node', [path.join(__dirname, 'import-from-obsidian.js')], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        
        importProcess.on('close', (code) => {
            if (code === 0) {
                console.log('');
                console.log('✅ Sync complete! Watching for changes...');
                console.log('');
            } else {
                console.error('');
                console.error('❌ Sync failed with code:', code);
            }
            isSyncing = false;
        });
        
        importProcess.on('error', (err) => {
            console.error('❌ Sync error:', err.message);
            isSyncing = false;
        });
    }, 2000);
}

const watcher = chokidar.watch(OBSIDIAN_PATH, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
    }
});

watcher
    .on('add', (filePath) => {
        if (filePath.endsWith('.md')) {
            console.log(`📄 File added: ${path.basename(filePath)}`);
            runImport();
        }
    })
    .on('change', (filePath) => {
        if (filePath.endsWith('.md')) {
            console.log(`✏️  File changed: ${path.basename(filePath)}`);
            runImport();
        }
    })
    .on('unlink', (filePath) => {
        if (filePath.endsWith('.md')) {
            console.log(`🗑️  File removed: ${path.basename(filePath)}`);
            runImport();
        }
    })
    .on('error', error => {
        console.error('❌ Watcher error:', error);
    });

console.log('👀 Watching for changes...');
console.log('');

process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Stopping watcher...');
    watcher.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('');
    console.log('🛑 Stopping watcher...');
    watcher.close();
    process.exit(0);
});
