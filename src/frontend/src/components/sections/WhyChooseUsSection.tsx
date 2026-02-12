import { Card, CardContent } from '@/components/ui/card';
import { siteContent } from '../../content/siteContent';

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            हमें क्यों चुनें? 💯
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            आपकी सेवा में हमारी प्रतिबद्धता
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {siteContent.whyChooseUs.map((reason, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8 pb-6 px-4">
                <div className="text-5xl mb-4">{reason.icon}</div>
                <p className="text-sm font-medium text-foreground leading-snug">{reason.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
