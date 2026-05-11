import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ConfirmImagePage from './pages/ConfirmImagePage';
import PreprocessingPage from './pages/PreprocessingPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ResultsPage from './pages/ResultsPage';
import GuidancePage from './pages/GuidancePage';
import UserGuidePage from './pages/UserGuidePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/user-guide" element={<UserGuidePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/confirm" element={<ConfirmImagePage />} />
          <Route path="/preprocessing" element={<PreprocessingPage />} />
          <Route path="/analyzing" element={<AnalyzingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/guidance" element={<GuidancePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}