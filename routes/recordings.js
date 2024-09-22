require("dotenv").config();
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const getFileMetadata = require("../utils/getFileMetadata");

const RECORDINGS_PATH = process.env.RECORDINGS_PATH;
const BASE_URL = process.env.BASE_URL;

const options = {
  month: "short",
  day: "numeric",
};

// GET ** /api/v1/recordings - Get all available recordings
router.get("/", async (_, res) => {
  try {
    const directories = await fs.promises.readdir(RECORDINGS_PATH);
    const filteredDirectories = directories.filter((directory) => !directory.startsWith("."));

    if (filteredDirectories.length > 0) {
      const directoryData = [];

      for (const directory of filteredDirectories) {
        const files = await fs.promises.readdir(`${RECORDINGS_PATH}/${directory}`);
        const filteredFiles = files.filter((file) => file.endsWith(".mp4"));

        if (filteredFiles.length > 0) {
          const directoryFilesList = await Promise.all(
            filteredFiles.map(async (file) => {
              const { name } = path.parse(file);
              const { birthTime, size } = await getFileMetadata(directory, file);
              return {
                id: nanoid(),
                name: name,
                directory: directory,
                creationDate: birthTime,
                size: size,
                path: `${BASE_URL}/${directory}/${file}`,
                thumbnail: `${BASE_URL}/${directory}/${file}.thumb`,
              };
            })
          );

          directoryFilesList.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

          directoryData.push({
            title: directory,
            data: directoryFilesList,
          });
        }
      }

      directoryData.sort((a, b) => new Date(b.title) - new Date(a.title));

      const modifiedDirectoryData = directoryData.map((directory) => ({
        ...directory,
        title: new Date(directory.title).toLocaleString("fr-FR", options),
      }));

      res.send(modifiedDirectoryData);
    } else {
      res.status(200).send({ message: "Pas de vidéo disponible." });
    }
  } catch (error) {
    console.error("Erreur sur /api/v1/recordings :", error);
    res.status(500).send({ message: "Erreur", err: error.message });
  }
});

// DELETE ** /api/v1/recordings/delete/:directory/:filename - Delete specified file 
router.delete("/delete/:directory/:filename", async (req, res) => {
  const { directory, filename } = req.params;
  const videoPath = `${RECORDINGS_PATH}/${directory}/${filename}.mp4`;
  const thumbnailPath = `${RECORDINGS_PATH}/${directory}/${filename}.mp4.thumb`;

  try {
    await fs.promises.unlink(videoPath);
    await fs.promises.unlink(thumbnailPath);
    res.status(200).send({ message: "Vidéo supprimée avec succès." });
  } catch (error) {
    console.error("Erreur sur /api/v1/recordings/delete :", error);
    res.status(500).send({ message: "Erreur", err: error.message });
  }
});

module.exports = router;
