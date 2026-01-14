import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { api } from "@/services/api";

// Helper to get env vars safely
const getEnv = (key: string) => {
    return import.meta.env[key] || '';
};

const firebaseConfig = {
    apiKey: getEnv("VITE_FIREBASE_API_KEY"),
    authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnv("VITE_FIREBASE_APP_ID")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
const auth = getAuth(app);

// Helper function to upload file
export const uploadImageToFirebase = async (file: File, path = 'products'): Promise<string> => {
    try {
        // Secure Auth: Exchange app session for Firebase Custom Token
        if (!auth.currentUser) {
            try {
                // Fetch custom token from our backend using existing session
                const response = await api.get('/auth/firebase-token');
                if (response.data && response.data.firebaseToken) {
                    await signInWithCustomToken(auth, response.data.firebaseToken);
                } else {
                    throw new Error('Failed to retrieve Firebase access token');
                }
            } catch (authError) {
                console.error("Firebase Auth Error:", authError);
                throw new Error("Authentication failed for upload");
            }
        }

        const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `${path}/${uniqueName}`);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading to Firebase:", error);
        throw error;
    }
};
