import { useEffect, useState } from 'react';
import NavigationBar from './components/NavigationBar';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import WhyChooseUsSection from './components/sections/WhyChooseUsSection';
import FormSection from './components/sections/FormSection';
import ContactSection from './components/sections/ContactSection';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Normalize path by removing trailing slash for comparison
  const normalizedPath = currentPath.replace(/\/$/, '');

  // Render admin page for /admin route (with or without trailing slash)
  if (normalizedPath === '/admin') {
    return <AdminPage />;
  }

  // Render main marketing site for all other routes
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyChooseUsSection />
        <FormSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
