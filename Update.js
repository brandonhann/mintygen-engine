const fs = require('fs');
const readline = require('readline');

const metadataPath = './build/metadata/';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function UpdateBaseUri() {
    rl.question('Enter the new IPFS link for the image: ', (newImageLink) => {
        UpdateFiles((item) => {
            item.image = newImageLink + '/' + item.id + '.png';
        }, 'Updated image link');
        rl.close();
    });
}

let currentPrefix = '';

function removeOldPrefix(name) {
    if (currentPrefix === '') {
        let matches = name.match(/#\d+/);
        return matches ? matches[0] : name;
    } else {
        return name.replace(currentPrefix + ' ', '');
    }
}

function UpdateNamePrefix() {
    rl.question('Enter the new name prefix (input "null" to remove): ', (namePrefix) => {
        if (namePrefix.toLowerCase() === 'null') {
            namePrefix = '';
        }

        UpdateFiles((item) => {
            let oldName = removeOldPrefix(item.name);

            item.name = namePrefix + (namePrefix === '' ? '' : ' ') + oldName;

            currentPrefix = namePrefix;
        }, 'Updated name prefix');

        rl.close();
    });
}


function RemoveSpec() {
    UpdateFiles((item) => {
        delete item.spec;
    }, 'Removed spec');
    rl.close();
}

function UpdateFiles(updateFunc, successMessage) {
    fs.readdir(metadataPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${err}`);
            return;
        }

        files.forEach((file) => {
            if (file.endsWith('.json')) {
                const filePath = metadataPath + file;

                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading file ${file}: ${err}`);
                        return;
                    }

                    let parsedData;

                    if (file === '_metadata.json') {
                        parsedData = JSON.parse(data);
                        parsedData.forEach(updateFunc);
                    } else {
                        parsedData = JSON.parse(data);
                        updateFunc(parsedData);
                    }

                    const updatedData = JSON.stringify(parsedData, null, 2);

                    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
                        if (err) {
                            console.error(`Error writing file ${file}: ${err}`);
                            return;
                        }
                        console.log(`${successMessage} in ${file}`);
                    });
                });
            }
        });
    });
}

function Menu() {
    console.log('1. Update BaseUri');
    console.log('2. Update Name Prefix');
    console.log('3. Remove Spec (Recommended)');
    console.log('Enter your choice (1, 2, or 3): ');

    rl.question('', (choice) => {
        switch (choice) {
            case '1':
                UpdateBaseUri();
                break;
            case '2':
                UpdateNamePrefix();
                break;
            case '3':
                RemoveSpec();
                break;
            default:
                console.log('Invalid choice. Please enter 1, 2, or 3.');
                rl.close();
        }
    });
}

Menu();
