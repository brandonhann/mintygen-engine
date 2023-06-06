const fs = require('graceful-fs').promises;

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

(async () => {
    let conversionMap = {};

    const nftString = (await fs.readFile("./build/metadata/_metadata.json")).toString();
    const nfts = JSON.parse(nftString);

    const intList = nfts.map(function (value) { return value.id; });

    const randomInts = shuffle(intList);

    for (const [index, int] of randomInts.entries()) {
        let nft = nfts[index];

        const currentId = nft.id;

        conversionMap[currentId] = int;

        console.log(`Converting NFT#${nft.id} to NFT#${int}`);

        nft.name = `${nft.name.split("#")[0].trim()} #${int}`;
        nft.id = int;
        nft.image = nft.image.replace(/\/(\d+)(.png|jpg|jpeg|gif)/g, `/${int}$2`);

        const image = await fs.readFile(`./build/images/${currentId}.png`);
        await fs.writeFile(`./build/images/${int}.png`, image);
    }

    await fs.writeFile("./build/metadata/_metadata.json", JSON.stringify(nfts, null, 2));

    for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];

        await fs.writeFile(`./build/metadata/${nft.id}.json`, JSON.stringify(nft, null, 2));
    }

    await fs.writeFile(`./build/conversion_map.json`, JSON.stringify(conversionMap, null, 2));
})();

