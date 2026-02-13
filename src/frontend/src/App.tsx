import { useEffect, useState } from 'react';
import { useOfficialLogin } from './hooks/useOfficialLogin';
import { navigateTo } from './utils/navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import NavigationBar from './components/NavigationBar';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import WhyChooseUsSection from './components/sections/WhyChooseUsSection';
import FormSection from './components/sections/FormSection';
import ContactSection from './components/sections/ContactSection';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { isOfficiallyLoggedIn } = useOfficialLogin();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setIsRedirecting(false);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Restore deep link from 404 fallback if present
  useEffect(() => {
    const savedPath = sessionStorage.getItem('requestedPath');
    if (savedPath && savedPath !== '/' && savedPath !== window.location.pathname) {
      sessionStorage.removeItem('requestedPath');
      navigateTo(savedPath, true);
    }
  }, []);

  const normalizedPath = currentPath.replace(/\/$/, '') || '/';

  // Admin route guard - only allow access if officially logged in
  if (normalizedPath === '/admin') {
    if (isOfficiallyLoggedIn) {
      return <AdminPage />;
    } else {
      if (!isRedirecting) {
        setIsRedirecting(true);
        navigateTo('/', true);
      }
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      );
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

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
