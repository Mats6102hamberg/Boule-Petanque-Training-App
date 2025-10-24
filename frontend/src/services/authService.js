// 🔐 Authentication Service
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

// 👤 Registrera ny användare
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Uppdatera display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    console.log('✅ User created:', user.uid);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Sign up error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🔑 Logga in
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User logged in:', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Sign in error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🚪 Logga ut
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log('✅ User logged out');
    return { success: true };
  } catch (error) {
    console.error('❌ Log out error:', error.message);
    return { success: false, error: error.message };
  }
};

// 👁️ Lyssna på auth state ändringar
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 📧 Återställ lösenord
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🔍 Hämta current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

export default {
  signUp,
  signIn,
  logOut,
  onAuthChange,
  resetPassword,
  getCurrentUser
};
