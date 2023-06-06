// Dev Tool - Cleans up images, metadata & conversion map
const fs = require('fs');
const path = require('path');

const imageDir = './build/images';
const metadataDir = './build/metadata';
const conversionMapFile = './build/conversion_map.json';

function removeFilesFromDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${err}`);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(directory, file);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}: ${err}`);
                    return;
                }

                console.log(`Deleted file: ${filePath}`);
            });
        });
    });
}

function removeFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file ${filePath}: ${err}`);
            return;
        }

        console.log(`Deleted file: ${filePath}`);
    });
}

removeFilesFromDirectory(imageDir);
removeFilesFromDirectory(metadataDir);
removeFile(conversionMapFile);