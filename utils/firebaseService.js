require("dotenv").config();
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, child, update } = require("firebase/database");
const { nanoid } = require("nanoid");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const databaseURL = process.env.FIREBASE_DATABASE_URL;
const db = getDatabase(app, databaseURL);
const dbRef = ref(db);

// Save user's ExpoPushToken
const saveToken = async (userId, token) => {
  const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
  const payload = { ...values, token };
  set(ref(db, `userTokens/${userId}/`), payload);
};

// Get user ExpoPushToken from id
const getToken = async (userId) => {
  const values = (await get(child(dbRef, `userTokens/${userId}/`))).val();
  return values ?? {};
};

// Save startTime using Date.now() from POST /start endpoint
const saveStartTime = async (userId) => {
  const eventId = nanoid();
  const startTime = Date.now();
  const payload = { [eventId]: { startTime } };
  update(ref(db, `users/${userId}`), payload);
};

// Find out what's the latest event registered and append an endTime
const saveEndTime = async (userId) => {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  const userData = snapshot.val();
  const eventIds = Object.keys(userData);
  const sortedEventIds = eventIds.sort((a, b) => userData[b].startTime - userData[a].startTime);
  const lastEventId = sortedEventIds[0];
  const endTime = Date.now();
  const payload = { [lastEventId]: { ...userData[lastEventId], endTime } };
  update(userRef, payload);
};

// Fetch user data for analytics
const fetchUserData = async (userId) => {
  const values = (await get(child(dbRef, `users/${userId}/`))).val();
  return values ?? {};
};

module.exports = { saveToken, getToken, saveStartTime, saveEndTime, fetchUserData };
