import { Heart } from 'lucide-react';
import { siteContent } from '../content/siteContent';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'vaishnavi-emitra'
  );

  return (
    <footer className="bg-muted/50 border-t border-border py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-3">{siteContent.business.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📍 {siteContent.business.location}</p>
              <p>👨‍💼 संचालक: {siteContent.business.operator}</p>
              <p>📞 {siteContent.business.phone}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">अस्वीकरण</h3>
            <p className="text-sm text-muted-foreground">{siteContent.footer.disclaimer}</p>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© {currentYear} {siteContent.business.name}. सर्वाधिकार सुरक्षित।</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
