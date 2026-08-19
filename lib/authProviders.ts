import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export function getFirebaseAuthErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred. Please try again.";

  const code = err.code || "";

  switch (code) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials.";
    case "auth/email-already-in-use":
      return "An account already exists with this email. Try signing in.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    case "auth/credential-already-in-use":
      return "This account is already linked to another user.";
    default:
      return err.message || "Authentication failed. Please try again.";
  }
}

/**
 * Google login with reverse-sync support
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    return await signInWithPopup(auth, provider);
  } catch (err: any) {
    if (err.code === "auth/account-exists-with-different-credential") {
      const email = err.customData?.email;
      if (!email) throw err;

      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("password")) {
        throw {
          code: "NEEDS_PASSWORD_LOGIN",
          email,
        };
      }
    }

    throw err;
  }
}

export async function loginWithEmail(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  return signInWithEmailAndPassword(auth, cleanEmail, password);
}

export async function signupWithEmail(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  return createUserWithEmailAndPassword(auth, cleanEmail, password);
}

export async function sendPasswordReset(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  return sendPasswordResetEmail(auth, cleanEmail);
}

export async function linkEmailPassword(email: string, password: string) {
  if (!auth.currentUser) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const credential = EmailAuthProvider.credential(email.trim().toLowerCase(), password);
  return linkWithCredential(auth.currentUser, credential);
}

export async function linkGoogleProvider() {
  if (!auth.currentUser) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const provider = new GoogleAuthProvider();
  return linkWithPopup(auth.currentUser, provider);
}