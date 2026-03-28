import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCaC8zO-d4QgtM7mDJ_9WIkdnxRjEx0bEI',
  authDomain: 'learning-japanese-app-25fab.firebaseapp.com',
  projectId: 'learning-japanese-app-25fab',
  storageBucket: 'learning-japanese-app-25fab.firebasestorage.app',
  messagingSenderId: '65983908860',
  appId: '1:65983908860:web:f247f69febc7fa58998079',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Sync user score to Firestore leaderboard
 */
export async function syncScore(deviceId, name, totalScore) {
  try {
    await setDoc(doc(db, 'leaderboard', deviceId), {
      name,
      totalScore,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('syncScore failed (offline?):', e.message);
    return false;
  }
}

/**
 * Fetch leaderboard — returns sorted array of { id, name, totalScore }
 */
export async function fetchLeaderboard() {
  const snap = await getDocs(collection(db, 'leaderboard'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Fetch taken display names (for manga character picker exclusion)
 */
export async function fetchTakenNames() {
  const snap = await getDocs(collection(db, 'leaderboard'));
  return snap.docs.map(d => d.data().name);
}
