import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { ArrowRight, Heart, BarChart3, Activity, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track privacy consents
  const [dataConsent, setDataConsent] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  
  // Combined privacy consent for enabling the button
  const privacyConsent = dataConsent && healthConsent;

  // Welcome screen steps
  const steps = [
    {
      title: 'Welcome to LUME',
      description: 'Discover the connection between your emotions and financial behavior.',
      icon: <Heart className="h-8 w-8 text-[#00f19f]" />
    },
    {
      title: 'Track Your Feelings',
      description: 'LUME analyzes your emotional patterns to help you make better financial decisions.',
      icon: <Activity className="h-8 w-8 text-[#00f19f]" />
    },
    {
      title: 'Get Personalized Insights',
      description: 'Receive tailored recommendations based on your emotional and financial data.',
      icon: <BarChart3 className="h-8 w-8 text-[#00f19f]" />
    },
    {
      title: 'Your Privacy Matters',
      description: 'We care about your privacy and only use your data to provide you with personalized insights.',
      icon: <Lock className="h-8 w-8 text-[#00f19f]" />,
      isPrivacyStep: true
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Only complete if on the privacy step and consent has been given
      // or if not on the privacy step
      if (!steps[currentStep].isPrivacyStep || privacyConsent) {
        onComplete();
      }
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2126] text-white">
      <div className="w-full max-w-md px-6 py-10">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mb-10">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full ${index <= currentStep ? 'bg-[#00f19f] w-12' : 'bg-gray-600 w-8'} transition-all`}
            />
          ))}
        </div>
        
        <div className="flex flex-col items-center text-center">
          {/* LUME Logo */}
          <div className="mb-8">
            <div className="text-3xl font-bold tracking-wider uppercase mb-1">LUME</div>
            <div className="text-sm text-gray-400">Your Emotions. Your Money.</div>
          </div>
          
          {/* Icon */}
          <div className="bg-[#2A363D] p-5 rounded-full mb-8">
            {steps[currentStep].icon}
          </div>
          
          {/* Content */}
          <h1 className="text-2xl font-bold mb-3">{steps[currentStep].title}</h1>
          <p className="text-gray-400 mb-10">{steps[currentStep].description}</p>
          
          {/* Personalized greeting if user exists */}
          {user && currentStep === 0 && (
            <p className="text-[#00f19f] mb-6">Welcome back, {user.name}!</p>
          )}
          
          {/* Privacy consent checkboxes - only shown on privacy step */}
          {steps[currentStep].isPrivacyStep && (
            <div className="w-full mb-8 text-left">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-[#2A363D] mb-3">
                <Checkbox 
                  id="privacy-consent" 
                  checked={privacyConsent}
                  onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                  className="mt-1 data-[state=checked]:bg-[#00f19f] data-[state=checked]:text-[#1a2126]"
                />
                <div>
                  <label 
                    htmlFor="privacy-consent" 
                    className="text-sm font-medium cursor-pointer block mb-1"
                  >
                    I agree to LUME's data collection practices
                  </label>
                  <p className="text-xs text-gray-400">
                    LUME collects and analyzes data about your emotions, financial transactions, and health metrics
                    to provide personalized insights. Your data is encrypted and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="w-full">
            <Button 
              onClick={nextStep}
              disabled={steps[currentStep].isPrivacyStep && !privacyConsent}
              className="w-full bg-[#00f19f] text-[#1a2126] hover:bg-[#00d989] disabled:bg-gray-600 disabled:text-gray-400 py-6 rounded-lg font-medium"
            >
              {currentStep < steps.length - 1 ? 'Continue' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {currentStep < steps.length - 1 && (
              <button 
                onClick={onComplete} 
                className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip Introduction
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}