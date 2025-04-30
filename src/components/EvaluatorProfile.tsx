
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface Evaluator {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  evaluationsCompleted: number;
  bio: string;
}

// This component displays an evaluator's profile card
interface EvaluatorProfileProps {
  evaluator: Evaluator;
  variant?: string; // Add variant prop for different styling options
}

const EvaluatorProfile: React.FC<EvaluatorProfileProps> = ({ 
  evaluator,
  variant
}) => {
  // Apply different styles based on variant
  const isCompact = variant === 'compact';
  
  return (
    <Card className={isCompact ? 'overflow-hidden' : ''}>
      <CardContent className={`p-${isCompact ? '4' : '6'}`}>
        <div className={`flex ${isCompact ? 'items-center' : 'flex-col md:flex-row gap-4 items-center md:items-start'}`}>
          <Avatar className={`${isCompact ? 'w-12 h-12' : 'w-20 h-20'}`}>
            <AvatarImage src={evaluator.avatarUrl} alt={evaluator.name} />
            <AvatarFallback>{evaluator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className={`flex-1 ${isCompact ? 'ml-3' : 'text-center md:text-left'}`}>
            <h3 className={`font-semibold ${isCompact ? 'text-base' : 'text-lg'}`}>{evaluator.name}</h3>
            
            <div className={`flex items-center ${isCompact ? '' : 'justify-center md:justify-start'} gap-1 mt-1`}>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} ${i < Math.floor(evaluator.rating) ? "text-yellow-400" : "text-gray-300"}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>{evaluator.rating}</span>
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground ml-1`}>
                ({evaluator.evaluationsCompleted} evaluations)
              </span>
            </div>
            
            {!isCompact && (
              <p className="text-sm text-muted-foreground mt-2">
                {evaluator.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluatorProfile;
