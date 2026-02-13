import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { siteContent } from '../../content/siteContent';

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-10 w-10 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              ❓ अक्सर पूछे जाने वाले प्रश्न
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            आपके सवालों के जवाब
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {siteContent.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left font-semibold text-base hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>उत्तर:</strong> {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
