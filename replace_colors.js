const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components'];
const extensions = ['.tsx', '.ts', '.css'];

function walkSync(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stats.isFile()) {
            callback(filepath);
        }
    });
}

console.log('Starting replacement...');
targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walkSync(dir, (filepath) => {
            if (extensions.some(ext => filepath.endsWith(ext))) {
                const content = fs.readFileSync(filepath, 'utf8');
                if (content.includes('orange')) {
                    // Replace all occurrences of orange with blue
                    const newContent = content.replace(/orange/g, 'blue');
                    fs.writeFileSync(filepath, newContent, 'utf8');
                    console.log(`Updated ${filepath}`);
                }
            }
        });
    }
});
console.log('Replacement complete.');
