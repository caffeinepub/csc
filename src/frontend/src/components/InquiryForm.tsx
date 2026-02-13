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
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
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

  const resetForm = () => {
    setFormData({
      inquiryType: 'contact',
      name: '',
      phoneNumber: '',
      email: '',
      message: '',
      serviceCategory: '',
    });
    setErrors({});
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
      resetForm();

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {showSuccess && (
        <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            धन्यवाद! आपकी पूछताछ सफलतापूर्वक प्राप्त हो गई है। हम जल्द ही आपसे संपर्क करेंगे।
          </AlertDescription>
        </Alert>
      )}

      {submitInquiry.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            पूछताछ भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <SelectItem value="contact">सामान्य पूछताछ</SelectItem>
              <SelectItem value="serviceRequest">सेवा अनुरोध</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.inquiryType === 'serviceRequest' && (
          <div className="space-y-2">
            <Label htmlFor="serviceCategory">सेवा श्रेणी</Label>
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
            placeholder="your@email.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">संदेश *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="अपना संदेश यहाँ लिखें..."
            rows={5}
            className={errors.message ? 'border-destructive' : ''}
          />
          {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitInquiry.isPending}>
          {submitInquiry.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              भेजा जा रहा है...
            </>
          ) : (
            'पूछताछ भेजें'
          )}
        </Button>
      </form>
    </div>
  );
}
