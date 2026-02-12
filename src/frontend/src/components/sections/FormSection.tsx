import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InquiryForm from '../InquiryForm';

export default function FormSection() {
  return (
    <section id="inquiry-form" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl font-bold">
                हमसे संपर्क करें 📞
              </CardTitle>
              <CardDescription className="text-base mt-2">
                कृपया नीचे दिए गए फॉर्म को भरें। हम जल्द ही आपसे संपर्क करेंगे।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InquiryForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
