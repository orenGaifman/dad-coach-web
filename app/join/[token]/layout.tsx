import { OnboardingProvider } from '@/src/components/onboarding/OnboardingProvider';

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6 py-8">
      <div className="max-w-md mx-auto">
        <OnboardingProvider>{children}</OnboardingProvider>
      </div>
    </div>
  );
}
