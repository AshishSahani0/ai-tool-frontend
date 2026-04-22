import {
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Google login with reverse-sync support
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

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
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function linkEmailPassword(email: string, password: string) {
  if (!auth.currentUser) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const credential = EmailAuthProvider.credential(email, password);
  return linkWithCredential(auth.currentUser, credential);
}

export async function linkGoogleProvider() {
  if (!auth.currentUser) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const provider = new GoogleAuthProvider();
  return linkWithPopup(auth.currentUser, provider);
}