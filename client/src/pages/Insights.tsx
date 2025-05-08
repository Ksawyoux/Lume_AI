import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import PersonalizedInsights from '@/components/PersonalizedInsights';

export default function Insights() {
  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16">
        {/* Personalized Insights Page */}
        <PersonalizedInsights />
      </main>

      <BottomNavigation />
    </div>
  );
}