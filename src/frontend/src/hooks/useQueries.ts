import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { InquiryType } from '../backend';

export function useSubmitInquiry() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      inquiryType: InquiryType;
      name: string;
      phoneNumber: string;
      email: string | null;
      message: string;
      serviceCategory: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      const id = await actor.submitInquiry(
        data.inquiryType,
        data.name,
        data.phoneNumber,
        data.email,
        data.message,
        data.serviceCategory
      );
      
      return id;
    },
  });
}
