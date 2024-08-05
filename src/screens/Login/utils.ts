import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setUser } from '../../store/authSlice';
import { Dispatch } from 'react';
import { STRINGS } from '../../const/strings';

/**
 * Handles Firebase authentication errors and sets the appropriate error message.
 * @param {any} error - The error object from Firebase.
 * @param {(error: string | null) => void} setError - Function to set the error message.
 */
export const handleFirebaseError = (error: any, setError: (error: string | null) => void) => {
  let errorMessage = STRINGS.errorUnknown;
  if (error.code === 'auth/user-not-found') {
    errorMessage = STRINGS.errorUserNotFound;
  } else if (error.code === 'auth/wrong-password') {
    errorMessage = STRINGS.errorWrongPassword;
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = STRINGS.errorInvalidEmail;
  } else if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = STRINGS.errorPopupClosed;
  } else if (error.code === 'auth/cancelled-popup-request') {
    errorMessage = STRINGS.errorMultiplePopup;
  } else if (error.message) {
    errorMessage = error.message;
  }
  setError(errorMessage);
};

/**
 * Validates the email and password inputs.
 * @param {string} email - The email address to validate.
 * @param {string} password - The password to validate.
 * @param {(errors: any) => void} setValidationErrors - Function to set validation errors.
 * @returns {boolean} - Returns true if the inputs are valid, false otherwise.
 */
export const validateInputs = (email: string, password: string, setValidationErrors: (errors: any) => void): boolean => {
  let valid = true;
  const errors = { email: '', password: '' };

  if (!email) {
    errors.email = STRINGS.emailRequired;
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = STRINGS.emailInvalid;
    valid = false;
  }

  if (!password) {
    errors.password = STRINGS.passwordRequired;
    valid = false;
  }

  setValidationErrors(errors);
  return valid;
};

/**
 * Handles the login process for email and password authentication.
 * @param {React.FormEvent} e - The form event.
 * @param {string} email - The email address.
 * @param {string} password - The password.
 * @param {(error: string | null) => void} setError - Function to set the error message.
 * @param {(errors: any) => void} setValidationErrors - Function to set validation errors.
 * @param {Dispatch<any>} dispatch - The dispatch function from Redux.
 * @param {(path: string) => void} navigate - Function to navigate to a different route.
 */
export const handleLogin = async (
  e: React.FormEvent,
  email: string,
  password: string,
  setError: (error: string | null) => void,
  setValidationErrors: (errors: any) => void,
  dispatch: Dispatch<any>,
  navigate: (path: string) => void
) => {
  e.preventDefault();
  setError(null);
  if (!validateInputs(email, password, setValidationErrors)) return;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    dispatch(setUser(userCredential.user));
    navigate('/dashboard');
  } catch (error: any) {
    handleFirebaseError(error, setError);
  }
};

/**
 * Handles the Google login process.
 * @param {Dispatch<any>} dispatch - The dispatch function from Redux.
 * @param {(path: string) => void} navigate - Function to navigate to a different route.
 * @param {(error: string | null) => void} setError - Function to set the error message.
 */
export const handleGoogleLogin = async (
  dispatch: Dispatch<any>,
  navigate: (path: string) => void,
  setError: (error: string | null) => void
) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDoc = doc(db, 'users', user.uid);
    const userDocSnapshot = await getDoc(userDoc);
    if (!userDocSnapshot.exists()) {
      await setDoc(userDoc, { uid: user.uid, email: user.email, createdAt: new Date().toISOString() });
    }
    dispatch(setUser(user));
    navigate('/dashboard');
  } catch (error: any) {
    handleFirebaseError(error, setError);
  }
};

/**
 * Handles opening the "Why This Product" section.
 */
export const handleOpenWhyThisProduct = () => {
  const element = document.getElementById('why-this-product-container');
  if (element) {
    element.style.display = 'block';
  }
};
