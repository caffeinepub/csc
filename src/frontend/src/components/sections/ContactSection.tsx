import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, User, MessageCircle } from 'lucide-react';
import { siteContent } from '../../content/siteContent';

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            हमारा पता 📍
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            आज ही पधारें और अपना काम चुटकियों में करवाएँ!
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">पता</h3>
                    <p className="text-muted-foreground">
                      {siteContent.business.name}
                      <br />
                      {siteContent.business.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">संचालक</h3>
                    <p className="text-muted-foreground">{siteContent.business.operator}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">संपर्क करें</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="default" asChild className="flex-1">
                        <a href={`tel:${siteContent.business.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          {siteContent.business.phone}
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="flex-1 border-2">
                        <a
                          href={siteContent.business.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
