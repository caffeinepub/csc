import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteContent } from '../../content/siteContent';

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            हमारी सेवाएँ 💼
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            सभी प्रकार की डिजिटल सेवाएँ एक ही स्थान पर
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteContent.services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{service.icon}</span>
                  <span>{service.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
