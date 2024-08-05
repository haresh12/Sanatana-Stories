import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebaseConfig';
import { Dispatch } from 'react';
import { setUser, setName } from '../../store/authSlice';
import { STRINGS } from '../../const/strings';

/**
 * Handles user signup using email and password.
 * @param {React.FormEvent} e - The form event.
 * @param {string} email - The email address.
 * @param {string} password - The password.
 * @param {string} name - The name of the user.
 * @param {Dispatch<any>} dispatch - The dispatch function from Redux.
 * @param {(path: string) => void} navigate - Function to navigate to a different route.
 * @param {(error: string | null) => void} setError - Function to set the error message.
 * @param {(loading: boolean) => void} setLoadingSignup - Function to set the loading state.
 */
export const handleSignup = async (
  e: React.FormEvent,
  email: string,
  password: string,
  name: string,
  dispatch: Dispatch<any>,
  navigate: any,
  setError: (error: string | null) => void,
  setLoadingSignup: (loading: boolean) => void,
) => {
  e.preventDefault();
  setError(null);
  setLoadingSignup(true);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      createdAt: new Date().toISOString(),
    });

    dispatch(setUser(user));
    dispatch(setName(name));
    navigate('/dashboard');
  } catch (error: any) {
    handleFirebaseError(error, setError);
  } finally {
    setLoadingSignup(false);
  }
};

/**
 * Handles user signup using Google authentication.
 * @param {Dispatch<any>} dispatch - The dispatch function from Redux.
 * @param {(path: string) => void} navigate - Function to navigate to a different route.
 * @param {(error: string | null) => void} setError - Function to set the error message.
 * @param {(loading: boolean) => void} setLoadingGoogle - Function to set the loading state.
 */
export const handleGoogleSignup = async (
  dispatch: Dispatch<any>,
  navigate: any,
  setError: (error: string | null) => void,
  setLoadingGoogle: (loading: boolean) => void,
) => {
  setLoadingGoogle(true);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Anonymous',
      createdAt: new Date().toISOString(),
    });

    dispatch(setUser(user));
    navigate('/dashboard');
  } catch (error: any) {
    handleFirebaseError(error, setError);
  } finally {
    setLoadingGoogle(false);
  }
};

/**
 * Handles Firebase authentication errors and sets the appropriate error message.
 * @param {any} error - The error object from Firebase.
 * @param {(error: string | null) => void} setError - Function to set the error message.
 */
export const handleFirebaseError = (error: any, setError: (error: string | null) => void) => {
  let errorMessage = STRINGS.errorUnknown;
  if (error.code === 'auth/email-already-in-use') {
    errorMessage = STRINGS.errorEmailInUse;
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = STRINGS.errorInvalidEmail;
  } else if (error.code === 'auth/operation-not-allowed') {
    errorMessage = STRINGS.errorOperationNotAllowed;
  } else if (error.code === 'auth/weak-password') {
    errorMessage = STRINGS.errorWeakPassword;
  } else if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = STRINGS.errorPopupClosed;
  } else if (error.code === 'auth/cancelled-popup-request') {
    errorMessage = STRINGS.errorMultiplePopup;
  } else if (error.message) {
    errorMessage = error.message;
  }
  setError(errorMessage);
};
