import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut
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
    const authReady = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user || null);
      });
    });

    await authReady;

    function getProgressRef(storyId) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user available.");
      }
      return doc(db, "users", user.uid, "progress", storyId);
    }

    return {
      enabled: true,
      get uid() {
        return auth.currentUser ? auth.currentUser.uid : null;
      },
      auth,
      getCurrentUser() {
        return auth.currentUser;
      },
      isAuthenticated() {
        return Boolean(auth.currentUser);
      },
      isEmailVerified() {
        return Boolean(auth.currentUser && auth.currentUser.emailVerified);
      },
      onAuthChange(callback) {
        return onAuthStateChanged(auth, callback);
      },
      async registerWithEmail(email, password) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(credential.user);
        return credential.user;
      },
      async loginWithEmail(email, password) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
      },
      async refreshCurrentUser() {
        if (!auth.currentUser) {
          return null;
        }
        await reload(auth.currentUser);
        return auth.currentUser;
      },
      async sendVerificationEmail() {
        if (!auth.currentUser) {
          throw new Error("No authenticated user available.");
        }
        await sendEmailVerification(auth.currentUser);
      },
      async logout() {
        await signOut(auth);
        return null;
      },
      async loadPlayerProgress(storyId) {
        if (!auth.currentUser || !auth.currentUser.emailVerified) {
          return null;
        }
        const snapshot = await getDoc(getProgressRef(storyId));
        return snapshot.exists() ? snapshot.data() : null;
      },
      async savePlayerProgress(storyId, payload) {
        if (!auth.currentUser || !auth.currentUser.emailVerified) {
          return null;
        }
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
