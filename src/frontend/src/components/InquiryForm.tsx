import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSubmitInquiry } from '../hooks/useQueries';
import { InquiryType } from '../backend';
import { serviceCategories } from '../content/siteContent';

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    inquiryType: 'contact' as 'contact' | 'serviceRequest',
    name: '',
    phoneNumber: '',
    email: '',
    message: '',
    serviceCategory: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const submitInquiry = useSubmitInquiry();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'कृपया अपना नाम दर्ज करें';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'कृपया अपना फोन नंबर दर्ज करें';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'कृपया सही फोन नंबर दर्ज करें (10 अंक)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'कृपया सही ईमेल दर्ज करें';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'कृपया अपना संदेश दर्ज करें';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitInquiry.mutateAsync({
        inquiryType: InquiryType[formData.inquiryType],
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || null,
        message: formData.message.trim(),
        serviceCategory: formData.serviceCategory || null,
      });

      setShowSuccess(true);
      setFormData({
        inquiryType: 'contact',
        name: '',
        phoneNumber: '',
        email: '',
        message: '',
        serviceCategory: '',
      });
      setErrors({});

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showSuccess && (
        <Alert className="bg-primary/10 border-primary">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <AlertDescription className="text-foreground font-medium">
            धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। हम जल्द ही आपसे संपर्क करेंगे।
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="inquiryType">पूछताछ का प्रकार *</Label>
        <Select
          value={formData.inquiryType}
          onValueChange={(value: 'contact' | 'serviceRequest') =>
            setFormData({ ...formData, inquiryType: value })
          }
        >
          <SelectTrigger id="inquiryType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contact">सामान्य संपर्क</SelectItem>
            <SelectItem value="serviceRequest">सेवा अनुरोध</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.inquiryType === 'serviceRequest' && (
        <div className="space-y-2">
          <Label htmlFor="serviceCategory">सेवा श्रेणी (वैकल्पिक)</Label>
          <Select
            value={formData.serviceCategory}
            onValueChange={(value) => setFormData({ ...formData, serviceCategory: value })}
          >
            <SelectTrigger id="serviceCategory">
              <SelectValue placeholder="सेवा चुनें" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">नाम *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="अपना नाम दर्ज करें"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">फोन नंबर *</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="10 अंकों का मोबाइल नंबर"
          className={errors.phoneNumber ? 'border-destructive' : ''}
        />
        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">ईमेल (वैकल्पिक)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="आपका ईमेल पता"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">संदेश / विवरण *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="अपना संदेश या सेवा की जानकारी यहाँ लिखें"
          rows={5}
          className={errors.message ? 'border-destructive' : ''}
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-base font-semibold"
        disabled={submitInquiry.isPending}
      >
        {submitInquiry.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            भेजा जा रहा है...
          </>
        ) : (
          'संदेश भेजें'
        )}
      </Button>
    </form>
  );
}
