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
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route path="/" element={<UserSelectScreen />} />
      <Route path="/home" element={currentUser ? <HomeScreen /> : <Navigate to="/" />} />
      <Route path="/flashcards" element={currentUser ? <FlashcardsScreen /> : <Navigate to="/" />} />
      <Route path="/flashcards/:deck" element={currentUser ? <CardDeckScreen /> : <Navigate to="/" />} />
      <Route path="/quiz" element={currentUser ? <QuizScreen /> : <Navigate to="/" />} />
      <Route path="/quiz/:quizType" element={currentUser ? <QuizPlayScreen /> : <Navigate to="/" />} />
      <Route path="/leaderboard" element={currentUser ? <LeaderboardScreen /> : <Navigate to="/" />} />
      <Route path="/kana-chart" element={currentUser ? <KanaChartScreen /> : <Navigate to="/" />} />
      <Route path="/help" element={currentUser ? <HelpScreen /> : <Navigate to="/" />} />
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
