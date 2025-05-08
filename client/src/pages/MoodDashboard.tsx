import { useUser } from '@/context/UserContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import MoodWeeklyRecovery from '@/components/MoodWeeklyRecovery';
import { useQuery } from '@tanstack/react-query';
import { Emotion, EmotionType } from '@shared/schema';
import { ArrowLeft } from 'lucide-react';

export default function MoodDashboard() {
  const { user } = useUser();
  
  // Weekly emotions data for recovery visualization
  const { data: weeklyEmotions } = useQuery<Emotion[]>({
    queryKey: user ? [`/api/users/${user.id}/emotions`] : [],
    enabled: !!user,
  });
  
  // Extract the emotion types
  const weeklyMoodTypes = weeklyEmotions?.map(emotion => emotion.type as EmotionType) || [];
  
  return (
    <div className="max-w-md mx-auto bg-[#161C21] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 pt-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center text-gray-400 cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft size={18} className="mr-1" />
            <span className="text-sm">Back</span>
          </div>
          <h1 className="text-lg font-semibold text-white">Mood Analysis</h1>
          <div className="w-8"></div> {/* For spacing balance */}
        </div>
        
        {/* WHOOP-style dark card for mood visualization */}
        <div className="bg-[#1a2126] rounded-lg p-4 mb-4">
          <div className="flex justify-center py-4">
            <MoodWeeklyRecovery weeklyMoods={weeklyMoodTypes} />
          </div>
        </div>
        
        {/* Details about moods */}
        <div className="bg-[#1a2126] rounded-lg p-4">
          <h2 className="text-sm font-semibold uppercase text-white mb-3">MOOD LOG</h2>
          
          {weeklyEmotions && weeklyEmotions.length > 0 ? (
            <div className="space-y-3">
              {weeklyEmotions.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-[#2A363D] last:border-0">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{
                        backgroundColor: 
                          emotion.type === 'happy' ? '#00f19f' :
                          emotion.type === 'content' ? '#4CC9F0' :
                          emotion.type === 'neutral' ? '#8D99AE' :
                          emotion.type === 'worried' ? '#EEB868' : '#FB5607'
                      }}
                    ></div>
                    <span className="text-sm text-white capitalize">{emotion.type}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(emotion.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400">No mood data recorded yet</p>
              <p className="text-xs text-gray-500 mt-1">Record your mood to see it reflected here</p>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}