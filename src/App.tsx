import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { setUser } from './store/authSlice';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Dashboard from './screens/Dashboard';
import TalkToGod from './screens/TalkToGod';
import ChatPage from './screens/ChatPage';
import PrivateRoute from './components/PrivateRoute';
import Epic from './screens/Epic';
import HanumanChalisa from './screens/HanumanChalisa';
import Community from './screens/Community';
import KnowAboutTemples from './screens/KnowAboutTemples';
import TempleDetail from './screens/TempleDetails';
import Quiz from './screens/QuizPage';
import BackgroundOverlay from './components/BackgroundOverlay';
import SummarizeSatsang from './screens/SummarizeSatsang';
import GeneratePodcast from './screens/GeneratePodcast';

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user));
    });
    return unsubscribe;
  }, [dispatch]);

  return (
    <Router>
      <BackgroundOverlay />
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
        <Route
          path="/talk-to-god"
          element={
            <PrivateRoute>
              <TalkToGod />
            </PrivateRoute>
          }
        />
        <Route
          path="/talk-to-god/:godId"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route path="/epic" element={<PrivateRoute><Epic /></PrivateRoute>} />
        <Route path="/hanuman-chalisa" element={<PrivateRoute><HanumanChalisa /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
        <Route path="/know-about-temples" element={<PrivateRoute><KnowAboutTemples /></PrivateRoute>} />
        <Route path="/temple/:templeId" element={<PrivateRoute><TempleDetail /></PrivateRoute>} />
        <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/summarize-satsang" element={<PrivateRoute><SummarizeSatsang /></PrivateRoute>} /> 
        <Route path="/generate-podcast" element={<PrivateRoute><GeneratePodcast /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
