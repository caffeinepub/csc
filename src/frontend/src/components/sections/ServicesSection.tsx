import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { siteContent } from '../../content/siteContent';

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🛠️ हमारी सेवाएँ - विस्तृत विवरण
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            हमने अपनी सेवाओं को 6 मुख्य विभागों में बाँटा है ताकि आप आसानी से अपनी जरूरत समझ सकें
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {siteContent.services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                  <span className="text-4xl">{service.icon}</span>
                  <div>
                    <div>{service.category}</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {service.subtitle}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {service.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                      <AccordionTrigger className="text-left font-semibold text-base hover:text-primary">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 pl-4">
                          {item.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-1 flex-shrink-0">✓</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
