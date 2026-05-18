import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

function hasRequiredConfig(config) {
  return Boolean(
    config &&
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  );
}

async function createFirebaseClient() {
  const config = window.FYD_FIREBASE_CONFIG || {};

  if (!hasRequiredConfig(config)) {
    return {
      enabled: false,
      reason: "missing-config",
      async loadPlayerProgress() {
        return null;
      },
      async savePlayerProgress() {
        return null;
      }
    };
  }

  try {
    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;

    function getProgressRef(storyId) {
      return doc(db, "users", uid, "progress", storyId);
    }

    return {
      enabled: true,
      uid,
      async loadPlayerProgress(storyId) {
        const snapshot = await getDoc(getProgressRef(storyId));
        return snapshot.exists() ? snapshot.data() : null;
      },
      async savePlayerProgress(storyId, payload) {
        await setDoc(
          getProgressRef(storyId),
          {
            ...payload,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
    };
  } catch (error) {
    console.error("Firebase init failed:", error);
    return {
      enabled: false,
      reason: "init-failed",
      error,
      async loadPlayerProgress() {
        return null;
      },
      async savePlayerProgress() {
        return null;
      }
    };
  }
}

window.FYDFirebase = {
  ready: createFirebaseClient()
};
