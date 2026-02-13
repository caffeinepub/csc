import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { siteContent } from '../../content/siteContent';

export default function MissionVisionSection() {
  return (
    <section id="mission-vision" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-2 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    🏆 {siteContent.mission.title}
                  </h2>
                </div>
              </div>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {siteContent.mission.content}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
