import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

// These values identify the Firebase project, they are not secrets. Access is guarded by the security rules in firestore.rules
const firebaseConfig = {
	apiKey: "AIzaSyB6h5c0xK6FwshOFBbUvSYAOgnLzNFCmGw",
	authDomain: "content-planner-4c9b4.firebaseapp.com",
	projectId: "content-planner-4c9b4",
	storageBucket: "content-planner-4c9b4.firebasestorage.app",
	messagingSenderId: "887700282031",
	appId: "1:887700282031:web:545c35ed7d44d9614e125a",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore | null = null;

export const getFirebaseAuth = () => {
	return getAuth(app);
};

// Only call this in the browser. The board is cached on the device so it opens and saves offline, in every open tab
export const getDb = () => {
	if (db) return db;

	try {
		db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
	} catch {
		// Already set up, which happens when this file reloads during development
		db = getFirestore(app);
	}

	return db;
};
