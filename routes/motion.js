require("dotenv").config();
const express = require("express");
const router = express.Router();
const { saveToken, getToken, saveStartTime, saveEndTime } = require("../utils/firebaseService");
const { Expo } = require("expo-server-sdk");

const expo = new Expo();

// POST ** /api/v1/motion/registerPushToken - Register new ExpoPushToken
router.post("/registerPushToken", async (req, res) => {
  const userId = String(req.body.userId);
  const token = String(req.body.token);
  try {
    await saveToken(userId, token);
    res.status(200).send({ message: `${token} enregistré avec succès.` });
  } catch (error) {
    console.error("Erreur sur /api/v1/motion/registerPushToken :", error);
    res.status(500).send({ message: "Erreur", err: error.message });
  }
});

// POST ** /api/v1/motion/start - Send notification & register new event in Firebase
// See https://github.com/expo/expo-server-sdk-node for details
router.post("/start", async (_, res) => {
  const userId = "0000002";
  try {
    const { token } = await getToken(userId);

    if (!Expo.isExpoPushToken(token)) {
      throw new Error(`${token} n'est pas un ExpoPushToken valide.`);
    }

    const messages = [
      {
        to: token,
        sound: "default",
        title: "Senior Protect",
        body: "Votre aîné a besoin d'aide !",
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Erreur à l'envoi du chunk :", error);
      }
    }

    await saveStartTime(userId);
    res.status(200).send({ message: "Début d'événement enregistré avec succès.", tickets });
  } catch (error) {
    console.error("Erreur sur /api/v1/motion/start :", error);
    res.status(500).send({ message: "Erreur", err: error.message });
  }
});

// POST ** /api/v1/motion/stop - Add endTime to latest event in Firebase
router.post("/stop", async (_, res) => {
  const userId = "0000002";
  try {
    await saveEndTime(userId);
    res.status(200).send({ message: "Fin d'événement enregistré avec succès." });
  } catch (error) {
    console.error("Erreur sur /api/v1/motion/stop :", error);
    res.status(500).send({ message: "Erreur", err: error.message });
  }
});

module.exports = router;
