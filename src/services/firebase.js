// Replace the firebaseConfig values with your own Firebase project credentials.
// Get them from: https://console.firebase.google.com → Project settings → Your apps → Web app
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyDobV2FUafEut4OMYC05wWSjI3Urqh8JpU",
  authDomain:        "die-agail.firebaseapp.com",
  projectId:         "die-agail",
  storageBucket:     "die-agail.firebasestorage.app",
  messagingSenderId: "806067482259",
  appId:             "1:806067482259:web:7a7c360580fd2be43aa766",
  measurementId:     "G-WCCNRHY6MX",
};

const app  = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db   = getFirestore(app);

const provider = new GoogleAuthProvider();

// ─── Auth helpers ────────────────────────────────────────────
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  onAuthStateChanged(auth, callback);
}

// ─── Firestore helpers ───────────────────────────────────────
async function ensureUserDoc(user) {
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:             user.uid,
      displayName:     user.displayName,
      email:           user.email,
      photoURL:        user.photoURL,
      highestLevel:    0,
      levelsCompleted: [],
      totalDeaths:     0,
      createdAt:       serverTimestamp(),
      updatedAt:       serverTimestamp(),
    });
  }
}

export async function loadUserProgress(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveProgress(uid, levelNumber, currentHighest) {
  const newHighest = Math.max(currentHighest, levelNumber);
  await setDoc(doc(db, 'users', uid), {
    highestLevel:    newHighest,
    levelsCompleted: arrayUnion(levelNumber),
    updatedAt:       serverTimestamp(),
  }, { merge: true });
  return newHighest;
}

export async function incrementDeaths(uid) {
  const ref  = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const d    = snap.exists() ? (snap.data().totalDeaths || 0) : 0;
  await setDoc(ref, { totalDeaths: d + 1, updatedAt: serverTimestamp() }, { merge: true });
}

export async function fetchLeaderboard() {
  const q    = query(
    collection(db, 'users'),
    orderBy('highestLevel', 'desc'),
    orderBy('updatedAt', 'asc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
