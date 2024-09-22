require("dotenv").config();
const fs = require("fs");

const defaultPath = process.env.RECORDINGS_PATH;

const getFileMetadata = async (directory, file) => {
  try {
    const stats = await fs.promises.stat(`${defaultPath}/${directory}/${file}`);
    return {
      birthTime: stats.birthtime,
      size: Number(stats.size / (1000 * 1024)).toFixed(1),
    };
  } catch (error) {
    console.error("Impossible de récupérer les métadonnées :", error);
  }
};

module.exports = getFileMetadata;
