import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import TopicDetailPage from './pages/TopicDetailPage';
import DownloadsPage from './pages/DownloadsPage';
import ToolPage from './pages/ToolPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 xl:p-16 mt-14 mb-32 md:mb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/explore/:topic" element={<TopicDetailPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/tools/:slug" element={<ToolPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
        <BackToTop />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
