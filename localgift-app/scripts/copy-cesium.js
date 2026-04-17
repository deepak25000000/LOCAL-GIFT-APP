const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const cesiumBuild = path.join(__dirname, '..', 'node_modules', 'cesium', 'Build', 'Cesium');
const publicCesium = path.join(__dirname, '..', 'public', 'cesium');

['Workers', 'ThirdParty', 'Assets', 'Widgets'].forEach(folder => {
    const src = path.join(cesiumBuild, folder);
    const dest = path.join(publicCesium, folder);
    console.log(`Copying ${folder}...`);
    copyDir(src, dest);
});

console.log('Cesium assets copied to public/cesium');
