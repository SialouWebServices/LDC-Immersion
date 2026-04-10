const sharp = require('sharp');
const fs = require('fs');

async function processIcons() {
    console.log("Processing icons...");
    const baseIcon = 'pwa-icon-512.png'; // This is actually a 1024x1024 JPG

    try {
        // Generate proper 192x192 PNG
        await sharp(baseIcon)
            .resize(192, 192)
            .png()
            .toFile('public/pwa-icon-192.png');
        console.log("Created public/pwa-icon-192.png (true PNG & 192x192)");

        // Generate proper 512x512 PNG
        await sharp(baseIcon)
            .resize(512, 512)
            .png()
            .toFile('public/pwa-icon-512.png');
         console.log("Created public/pwa-icon-512.png (true PNG & 512x512)");

        // Also replace the ones in root just in case
        await sharp(baseIcon)
            .resize(192, 192)
            .png()
            .toFile('pwa-icon-192.png');
        await sharp(baseIcon)
            .resize(512, 512)
            .png()
            .toFile('pwa-icon-512.png');

        console.log("Successfully fixed icons!");
    } catch (err) {
        console.error("Error processing icons:", err);
    }
}

processIcons();
