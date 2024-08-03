import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setUser } from '../../store/authSlice';
import { Dispatch } from 'react';

export const handleFirebaseError = (error: any, setError: (error: string | null) => void) => {
  let errorMessage = 'An unknown error occurred. Please try again.';
  if (error.code === 'auth/user-not-found') {
    errorMessage = 'No user found with this email. Please sign up first.';
  } else if (error.code === 'auth/wrong-password') {
    errorMessage = 'Incorrect password. Please try again.';
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = 'The email address is not valid.';
  } else if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = 'The Google sign-in popup was closed before completing the sign-in. Please try again.';
  } else if (error.code === 'auth/cancelled-popup-request') {
    errorMessage = 'Multiple popup requests. Please try again.';
  } else if (error.message) {
    errorMessage = error.message;
  }
  setError(errorMessage);
};

export const validateInputs = (email: string, password: string, setValidationErrors: (errors: any) => void) => {
  let valid = true;
  const errors = { email: '', password: '' };

  if (!email) {
    errors.email = 'Email is required';
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email address is invalid';
    valid = false;
  }

  if (!password) {
    errors.password = 'Password is required';
    valid = false;
  }

  setValidationErrors(errors);
  return valid;
};

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

export const handleGoogleLogin = async (dispatch: Dispatch<any>, navigate: (path: string) => void, setError: (error: string | null) => void) => {
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

export const handleOpenWhyThisProduct = () => {
  const element = document.getElementById('why-this-product-container');
  if (element) {
    element.style.display = 'block';
  }
};
