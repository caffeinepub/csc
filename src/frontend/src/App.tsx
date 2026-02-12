import NavigationBar from './components/NavigationBar';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import WhyChooseUsSection from './components/sections/WhyChooseUsSection';
import FormSection from './components/sections/FormSection';
import ContactSection from './components/sections/ContactSection';
import Footer from './components/Footer';

export default function App() {
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
