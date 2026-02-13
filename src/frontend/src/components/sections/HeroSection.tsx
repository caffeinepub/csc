import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { siteContent } from '../../content/siteContent';
import OfficialLoginDialog from '../admin/OfficialLoginDialog';
import { navigateTo } from '../../utils/navigation';

export default function HeroSection() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleLoginSuccess = () => {
    setLoginDialogOpen(false);
    navigateTo('/admin');
  };

  return (
    <section id="home" className="relative min-h-[700px] md:min-h-[800px] flex items-center pt-16 md:pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/assets/generated/vaishnavi-hero.dim_1600x900.png"
          alt="वैष्णवी ई-मित्र & CSC सेवा केंद्र"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 py-12 md:py-20">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              🌐 {siteContent.business.name} 🌐
            </h1>
            <p className="text-xl md:text-2xl text-primary font-semibold">
              {siteContent.business.tagline}
            </p>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              ({siteContent.business.subtitle})
            </p>
          </div>

          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            <p className="font-semibold text-foreground">👋 {siteContent.hero.greeting}</p>
            <p>{siteContent.hero.intro}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-semibold px-8 py-6"
              asChild
            >
              <a href={`tel:${siteContent.business.phone}`}>
                <Phone className="mr-2 h-5 w-5" />
                कॉल करें
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base font-semibold px-8 py-6 border-2"
              asChild
            >
              <a href={siteContent.business.whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp करें
              </a>
            </Button>
          </div>

          <div className="pt-8 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLoginDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Official Login
            </Button>
          </div>

          <div className="pt-4 text-sm text-muted-foreground">
            📍 {siteContent.business.location}
          </div>
        </div>
      </div>

      <OfficialLoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={handleLoginSuccess}
      />
    </section>
  );
}
