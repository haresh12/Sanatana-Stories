// src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { setUser } from './store/authSlice';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Dashboard from './screens/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Ramayan from './screens/Ramayan';
import Mahabharat from './screens/Mahabharat';
import HinduPuranas from './screens/HinduPuranas';
import HanumanChalisa from './screens/HanumanChalisa';
import TalkToGod from './screens/TalkToGod';
import Community from './screens/Community';
import KnowAboutTemples from './screens/KnowAboutTemples';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user));
    });
    return unsubscribe;
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/ramayan" element={<PrivateRoute><Ramayan /></PrivateRoute>} />
        <Route path="/mahabharat" element={<PrivateRoute><Mahabharat /></PrivateRoute>} />
        <Route path="/hindu-puranas" element={<PrivateRoute><HinduPuranas /></PrivateRoute>} />
        <Route path="/hanuman-chalisa" element={<PrivateRoute><HanumanChalisa /></PrivateRoute>} />
        <Route path="/talk-to-god" element={<PrivateRoute><TalkToGod /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
        <Route path="/know-about-temples" element={<PrivateRoute><KnowAboutTemples /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
