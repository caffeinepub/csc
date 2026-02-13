import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, User, MessageCircle, Mail, Clock } from 'lucide-react';
import { siteContent } from '../../content/siteContent';

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            📞 संपर्क सूत्र और पता
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            हमें आपकी सेवा करने में खुशी होगी। कृपया पधारें:
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8 md:p-10">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">📍 पता</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {siteContent.business.name}
                      <br />
                      {siteContent.business.fullAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">👤 संचालक (Proprietor)</h3>
                    <p className="text-muted-foreground">{siteContent.business.operator}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">📱 मोबाइल / WhatsApp</h3>
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

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">📧 ईमेल</h3>
                    <a
                      href={`mailto:${siteContent.business.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {siteContent.business.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">🕒 समय सारिणी (Opening Hours)</h3>
                    <p className="text-muted-foreground">{siteContent.business.openingHours}</p>
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
