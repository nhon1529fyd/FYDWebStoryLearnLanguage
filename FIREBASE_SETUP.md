# Firebase setup

This project is ready for Firebase Hosting and optional Firestore progress saving.

## 1. Create your Firebase project

1. Open Firebase Console.
2. Create a project.
3. Add a Web app.
4. Enable:
   - Hosting
   - Firestore Database
   - Authentication -> Anonymous

## 2. Fill your web config

Edit `firebase-config.js` and paste the config from Firebase Console:

```js
window.FYD_FIREBASE_CONFIG = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 3. Connect CLI to your Firebase project

Copy `.firebaserc.example` to `.firebaserc` and replace the project id:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Then run:

```powershell
firebase login
firebase use --add
firebase deploy
```

## 4. What is already wired

- `firebase.json`: Hosting + Firestore config
- `firebase-client.js`: initializes Firebase, signs in anonymously, exposes helper methods
- `story_engine.js`: loads and saves player progress to Firestore when Firebase is configured

If Firebase is not configured yet, the game still works with local JSON story data.
