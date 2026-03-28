import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import UserSelectScreen from './screens/UserSelectScreen';
import HomeScreen from './screens/HomeScreen';
import FlashcardsScreen from './screens/FlashcardsScreen';
import CardDeckScreen from './screens/CardDeckScreen';
import QuizScreen from './screens/QuizScreen';
import QuizPlayScreen from './screens/QuizPlayScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import KanaChartScreen from './screens/KanaChartScreen';
import HelpScreen from './screens/HelpScreen';

function AppRoutes() {
  const { displayName } = useApp();
  const loggedIn = !!displayName;
  return (
    <Routes>
      <Route path="/" element={loggedIn ? <Navigate to="/home" /> : <UserSelectScreen />} />
      <Route path="/home" element={loggedIn ? <HomeScreen /> : <Navigate to="/" />} />
      <Route path="/flashcards" element={loggedIn ? <FlashcardsScreen /> : <Navigate to="/" />} />
      <Route path="/flashcards/:deck" element={loggedIn ? <CardDeckScreen /> : <Navigate to="/" />} />
      <Route path="/quiz" element={loggedIn ? <QuizScreen /> : <Navigate to="/" />} />
      <Route path="/quiz/:quizType" element={loggedIn ? <QuizPlayScreen /> : <Navigate to="/" />} />
      <Route path="/leaderboard" element={loggedIn ? <LeaderboardScreen /> : <Navigate to="/" />} />
      <Route path="/kana-chart" element={loggedIn ? <KanaChartScreen /> : <Navigate to="/" />} />
      <Route path="/help" element={loggedIn ? <HelpScreen /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
