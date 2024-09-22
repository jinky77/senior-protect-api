const express = require("express");
const router = express.Router();
const { fetchUserData } = require("../utils/firebaseService");

// GET ** /api/v1/users/getUserData - Get user data
// To-Do: Changer la route pour /api/v1/users/getUserData/:id
router.get("/getUserData", async (_, res) => {
  // To-Do: au lieu de userId = "0000001", faire : const { userId } = req.params;
  const userId = "0000001";
  const data = await fetchUserData(userId);

  const collectionsByMonth = {};

  for (const id in data) {
    const collection = data[id];
    const endTime = new Date(collection.endTime);
    const month = endTime.getMonth(); // Get the month index (0-11)

    if (!collectionsByMonth[month]) {
      collectionsByMonth[month] = 0;
    }

    collectionsByMonth[month]++;
  }

  const formattedData = Object.entries(collectionsByMonth)
    .sort((a, b) => a[0] - b[0]) // Sort the data by month index
    .map(([month, events]) => ({
      month: new Date(new Date().getFullYear(), month).toLocaleString("fr-FR", { month: "short", year: "2-digit" }), // Use the current year instead of the default year
      events,
    }));

  res.json(formattedData);
});

module.exports = router;
