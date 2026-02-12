import { useEffect, useState } from 'react';
import { useOfficialLogin } from './hooks/useOfficialLogin';
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
  const { isOfficiallyLoggedIn } = useOfficialLogin();

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const normalizedPath = currentPath.replace(/\/$/, '');

  if (normalizedPath === '/admin') {
    if (isOfficiallyLoggedIn) {
      return <AdminPage />;
    } else {
      window.history.replaceState(null, '', '/');
      setCurrentPath('/');
    }
  }

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
