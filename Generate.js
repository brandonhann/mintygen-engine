const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const isPkg = typeof process.pkg === "undefined";
const parentFolder = isPkg ? process.cwd() : path.dirname(process.execPath);
const buildFolder = `${parentFolder}/build`;
var layerDir = `${parentFolder}/layers/C`;
const colors = require("colors");

const engine_version = 1.1;
const compatible_compiler_version = 1.0;

let config;
try {
  config = require("./config.json");
} catch (error) {
  console.error(colors.red("Error: config.json is not found"));
}

const requiredKeys = [
  "quantity",
  "width",
  "r_percent",
  "c_percent",
  "superrare",
  "u_percent",
  "network",
  "title",
  "baseUri",
  "uncommon",
  "desc",
  "s_percent",
  "rare",
  "compiler_version",
  "height",
  "common",
  "layers",
  "starting_count",
];

const solKeys = {
  external_url: "",
  creators: [],
  symbol: "",
  seller_fee_basis_points: parseInt("0"),
};


const keys = config.map((item) => item.key);

if (!requiredKeys.every((key) => keys.includes(key))) {
  throw new Error(colors.red("Missing required keys in config file"));
}

if (config.some((item) => item.value === "" || item.value === null)) {
  throw new Error(
    colors.red("Values for required keys cannot be undefined or null")
  );
}

config.forEach((item) => {
  if (item.key && item.value) {
    if (item.key === 'starting_count') {
      global[item.key] = parseInt(item.value, 10);
    } else {
      global[item.key] = item.value;
    }
  }
});


if (network === "Solana") {
  for (const key in solKeys) {
    if (!keys.includes(key)) {
      global[key] = solKeys[key];
    }
  }

  if (keys.includes("creators")) {
    global["creators"] = JSON.parse(creators);
  }
}

if (compiler_version < compatible_compiler_version) {
  throw new Error(
    colors.red(
      "config.json is out of date and is using an old compiler version. Compiler version must be at least v." +
      compatible_compiler_version
    )
  );
}

const engineName = "MintyGen Engine " + engine_version.toFixed(1) + " (Pre-Release)";

console.log(colors.yellow.bold(engineName));
console.log(config);
if (network == "Ethereum") {
  console.log(colors.blue("Building for " + network + " Network..."));
} else if (network == "Solana") {
  console.log(colors.magenta("Building for " + network + " Network..."));
}

var specArray = [];
var metadataArray = [];
var attributesArray = [];
const rarityType = [common, uncommon, rare, superrare];
var rarityDistribution = [c_percent, u_percent, r_percent, s_percent];
const rarityCounts = {};

let rememberedQuantity;

function CalculateRarity() {
  rarityDistribution = rarityDistribution.map((val) => parseInt(val, 10));

  if (rarityDistribution.reduce((acc, val) => acc + val, 0) !== 100) {
    throw new Error(
      colors.red(
        "Error: Rarity distribution cannot add up to more or less than 100%"
      )
    );
  }
  for (let i = 0; i < rarityType.length; i++) {
    let count = Math.floor((rarityDistribution[i] * quantity) / 100);
    rarityCounts[rarityType[i]] = count;
  }
  let remainder =
    quantity - Object.values(rarityCounts).reduce((acc, val) => acc + val, 0);
  rarityCounts[rarityType[rarityType.length - 1]] += remainder;
  console.log(rarityCounts);
  rememberedQuantity = rarityCounts.Common;
};

const format = {
  width,
  height,
};

const canvas = createCanvas(parseInt(format.width), parseInt(format.height));
const ctx = canvas.getContext("2d");

function InitDirs() {
  try {
    if (fs.existsSync(buildFolder)) {
      fs.rmSync(buildFolder, { recursive: true });
    }
  } catch (err) {
    console.error(`Error while removing buildFolder: ${err.message}`);
  }

  try {
    fs.mkdirSync(buildFolder);
    fs.mkdirSync(path.join(buildFolder, "/metadata"));
    fs.mkdirSync(path.join(buildFolder, "/images"));
  } catch (err) {
    console.error(`Error while creating directories: ${err.message}`);
  }
}

function InitLayers(layers) {
  const layersArray = JSON.parse(layers);

  function processLayer(layerObj, index) {
    try {
      const path = `${layerDir}/${layerObj.name}/`;
      const layerAttributes = fs
        .readdirSync(path, { withFileTypes: true })
        .filter((dirent) => dirent.isFile() && !dirent.name.startsWith("."))
        .map((dirent) => {
          const extensionStartIndex = dirent.name.lastIndexOf(".");
          const name =
            extensionStartIndex < 0
              ? dirent.name
              : dirent.name.slice(0, extensionStartIndex);

          return {
            name: name,
            path: `${path}${dirent.name}`,
          };
        });

      return {
        id: index,
        name: layerObj.name,
        attributes: layerAttributes,
      };
    } catch (error) {
      console.error(
        colors.red(
          `${layerObj.name} layer not found in ${layerDir
            .split("/")
            .pop()}, skipping layer.`
        )
      );
      return null;
    }
  }

  const isValidLayer = (layer) => layer !== null;

  const matchLayers = layersArray.map(processLayer).filter(isValidLayer);
  return matchLayers;
}

function AppendMetadata(_spec, _quantity) {
  const metadata = {
    name: `#${_quantity}`,
    description: desc,
    rarity: "",
    image: `${baseUri}/${_quantity}.png`,
    id: _quantity,
    attributes: attributesArray,
    spec: _spec.join(""),
    time: Date.now(),
    engine:
      "Collection made with MintyGen Engine " +
      "v." +
      engine_version.toFixed(1) +
      " https://mintygen.com",
  };

  if (network === "Solana") {
    metadata.creators = creators;
    metadata.seller_fee_basis_points = parseInt(seller_fee_basis_points);
    metadata.symbol = symbol;
    metadata.external_url = external_url;
  }

  for (let r in rarityCounts) {
    if (rarityCounts[r] > 0) {
      metadata.rarity = r;
      rarityCounts[r]--;
      break;
    }
  }

  metadataArray.push(metadata);

  attributesArray = [];
}

function AppendAttributes(_attribute) {
  const { selectedAttribute } = _attribute.layer;
  const { name } = _attribute.layer;

  attributesArray = [
    ...attributesArray,
    {
      trait_type: name,
      value: selectedAttribute.name,
    },
  ];
}

async function SaveImage(_attributeCount) {
  return Promise.all(promiseArray)
    .then(() =>
      fs.promises.writeFile(
        `${buildFolder}/images/${_attributeCount}.png`,
        canvas.toBuffer("image/png")
      )
    );
}

function SaveMetadata(_data, singleFile) {
  if (singleFile) {
    function writeMetadataFile(metadata) {
      const metadataPath = `${buildFolder}/metadata/${metadata.id}.json`;
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    };

    metadataArray.forEach(writeMetadataFile);
  } else {
    const metadataPath = `${buildFolder}/metadata/_metadata.json`;
    fs.writeFileSync(metadataPath, _data);
  }
};

function SpecifyLayers(_spec = [], _layers = []) {
  if (typeof _layers === "string") {
    _layers = JSON.parse(_layers);
  }

  function processLayer(layer, index) {
    let selectedAttribute = layer.attributes[_spec[index]];
    return {
      name: layer.name,
      selectedAttribute: selectedAttribute,
    };
  };

  const mappedSpecToLayers = _layers.map(processLayer);
  return mappedSpecToLayers;
};

let quantityCount = starting_count;
let promiseArray = [];

async function Generate(_stage) {
  if (_stage == 2) {
    rememberedQuantity = rememberedQuantity + rarityCounts.Uncommon;
  } else if (_stage == 3) {
    rememberedQuantity = rememberedQuantity + rarityCounts.Rare;
  } else if (_stage == 4) {
    rememberedQuantity = rememberedQuantity + rarityCounts.SuperRare;
  }

  let failedCount = 0;
  const buildLayers = InitLayers(layers);
  while (quantityCount <= rememberedQuantity) {
    let newSpec = buildLayers.map(layer => Math.floor(Math.random() * layer.attributes.length));
    let existingSpecIndex = specArray.findIndex(existingSpec => existingSpec.join("") === newSpec.join(""));
    if (existingSpecIndex === -1) {
      let results = SpecifyLayers(newSpec, buildLayers);
      let loadedAttributes = [];

      results.forEach((layer) => {
        const loadImagePath = `${layer.selectedAttribute.path}`;
        const loadedImage = loadImage(loadImagePath);
        loadedAttributes.push({
          layer: layer,
          loadedImage: loadedImage,
        });
      });

      let attributeArray = [];

      loadedAttributes.forEach((e) => {
        attributeArray.push(e);
      });
      ctx.clearRect(0, 0, format.width, format.height);

      attributeArray.forEach((attribute) => {
        const handleLoadedImage = (e) => {
          promiseArray.push(e);
          ctx.drawImage(e, 0, 0, format.width, format.height);
        };

        attribute.loadedImage.then(handleLoadedImage);
        AppendAttributes(attribute);
      });

      SaveImage(quantityCount);
      AppendMetadata(newSpec, quantityCount);
      SaveMetadata(JSON.stringify((quantityCount, null, 2)), true);
      console.log(`id: ${quantityCount}, specification: ${newSpec.join('')}`);
      specArray.push(newSpec);
      quantityCount++;
    } else {
      console.log(
        colors.yellow(`id: ${quantityCount}, Spec ${specArray[existingSpecIndex].join('')} already exists. Attempting new spec...`)
      );
      failedCount++;
      if (failedCount >= quantity) {
        console.log(`Not enough attributes to generate ${quantity} of images.`);
        process.exit();
      }
    }
  }
  SaveMetadata(JSON.stringify(metadataArray, null, 2));
};

async function Staging() {
  for (let i = 1; i <= 4; i++) {
    if (i === 1) {
      layerDir = `${parentFolder}/layers/C`;
      stage = 1;
      Generate(stage);
    } else if (i === 2) {
      layerDir = `${parentFolder}/layers/U`;
      stage = 2;
      Generate(stage);
    } else if (i === 3) {
      layerDir = `${parentFolder}/layers/R`;
      stage = 3;
      Generate(stage);
    } else if (i === 4) {
      layerDir = `${parentFolder}/layers/SR`;
      stage = 4;
      Generate(stage);
    }
  }

  await Promise.all(promiseArray);
  console.log(colors.green("Success! Your collection has been generated."));
}

CalculateRarity();
InitDirs();
Staging();
