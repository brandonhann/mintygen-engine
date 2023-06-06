# NFT Generator Engine

This is an NFT (Non-Fungible Token) generator engine that allows you to generate NFT collections with different rarities, shuffle them around for randomization, and provides various update options such as BaseURI, name prefix, and removing the spec attribute from the generated NFTs. This project was inspired by the HashLips NFT generator, and I would like to give credit to them for the initial idea.

## Prerequisites

Before using this NFT generator engine, you must have Node.js installed on your system. If you haven't already, please visit the [Node.js download page](https://nodejs.org/en/download/) to download and install the latest version.

## Getting Started

To get started, clone this repository onto your local machine and navigate to the root directory of the project. From there, you will need to paste the `config.json` file that you downloaded from the [MintyGen](https://mintygen.com/app) web compiler.

After pasting the `config.json` file, run the `Run.sh` (for macOS/Linux) or `Run.bat` (for Windows) file. If the required Node.js modules are not installed, the script will automatically run the `npm i` command to install them.

The `Run.sh` or `Run.bat` file will prompt you with three options:

1. Generate
2. Shuffle
3. Update

Here's what each option does:

### Generate

This option runs `node Generate.js` and generates the NFT collection based on the `config.json` file that you previously pasted. The generated NFTs will be saved under `./build/images` and `./build/metadata`.

### Shuffle

This option runs `node Shuffle.js` and shuffles the NFTs around to randomize rarity. This is useful if you want to randomize the rarity of your NFTs.

### Update

This option runs `node Update.js`, which provides an interactive menu with the following options:

1. Update BaseUri
2. Update Name Prefix
3. Remove Spec (Recommended)

These options allow you to:

- Update the BaseURI after the images are uploaded to IPFS. This is useful if you want to change the location of your NFT images.
- Update the name prefix for your NFTs. This is useful if you want to change the naming convention of your NFTs.
- Remove the spec attribute from the metadata. This is recommended for cleaning up the metadata before deployment.

To use the Update option, simply run `node Update.js` and follow the prompts.

## Setting up Layers

Before generating NFTs, you must set up the layers under the `./layers` folder. There are four types of layers:

- `./layers/C` (common)
- `./layers/U` (uncommon)
- `./layers/R` (rare)
- `./layers/SR` (super rare)

Under each of these directories, you can create subfolders and place the `.png` files for the layers/attributes. The NFT generator engine will use these layers to determine which of each rarity will receive which attribute.

## Conclusion

That's it! With this NFT generator engine, you can easily generate NFT collections with different rarities, shuffle them around for randomization, and update the baseURI of the generated NFTs. If you have any questions or issues, please feel free to reach out.
