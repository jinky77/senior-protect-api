const express = require("express");
const router = express.Router();
const { fetchUserData } = require("../utils/firebaseService");
const { startOfDay, startOfWeek, startOfMonth, startOfYear, addDays, addWeeks, addMonths, isSameDay, isSameWeek, isSameMonth } = require("date-fns");
const getAnalytics = require("../utils/getAnalytics");

const timeframeConfigs = {
  day: {
    startOf: startOfDay,
    increment: addDays,
    isSame: isSameDay,
    format: "dd MMM",
    count: 1,
  },
  week: {
    startOf: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    increment: addDays,
    isSame: isSameDay,
    format: "EEEEE",
    count: 7,
  },
  month: {
    startOf: startOfMonth,
    increment: addWeeks,
    isSame: isSameWeek,
    format: "dd/MM",
    count: 5, // Simplified to always show 5 weeks
  },
  year: {
    startOf: (date) => startOfMonth(new Date(date.getFullYear(), 5)),
    increment: addMonths,
    isSame: isSameMonth,
    format: "MMM yy",
    count: 6,
  },
};

// GET /api/v1/users/getAllAnalytics - Get user data for all timeframes
// To-Do: Changer la route pour /api/v1/users/getUserData/:id
router.get("/getAllAnalytics", async (req, res) => {
  try {
    // To-Do: Replace "0000001" with actual user ID retrieval logic
    const userId = "0000001";
    const data = await fetchUserData(userId);

    const allAnalytics = {};
    for (const [timeframe, config] of Object.entries(timeframeConfigs)) {
      allAnalytics[timeframe] = getAnalytics(data, config, timeframe);
    }

    res.json(allAnalytics);
  } catch (error) {
    console.error("Error fetching all analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/users/getUserData/:timeframe - Get user data for specific timeframe
// To-Do: Changer la route pour /api/v1/users/getUserData/:id
router.get("/getUserData/:timeframe", async (req, res) => {
  const { timeframe } = req.params;
  // To-Do: au lieu de userId = "0000001", faire : const { userId } = req.params;
  const userId = "0000001";
  const data = await fetchUserData(userId);

  const config = timeframeConfigs[timeframe];
  if (!config) {
    return res.status(400).json({ error: "Période invalide" });
  }

  const response = getAnalytics(data, config, timeframe);
  res.json(response);
});

module.exports = router;
