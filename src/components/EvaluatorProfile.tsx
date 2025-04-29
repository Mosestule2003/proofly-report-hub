
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock } from 'lucide-react';

export interface Evaluator {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  evaluationsCompleted: number;
  bio: string;
}

interface EvaluatorProfileProps {
  evaluator: Evaluator;
  variant?: 'full' | 'compact';
  className?: string;
}

const EvaluatorProfile: React.FC<EvaluatorProfileProps> = ({ 
  evaluator, 
  variant = 'full',
  className = ''
}) => {
  return (
    <div className={`bg-card rounded-lg border p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={evaluator.avatarUrl} alt={evaluator.name} />
          <AvatarFallback>{evaluator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium">{evaluator.name}</h3>
          <div className="flex items-center text-amber-500 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(evaluator.rating) ? 'fill-current' : 'text-muted-foreground opacity-30'}`} 
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {evaluator.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      {variant === 'full' && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{evaluator.evaluationsCompleted} evaluations completed</span>
          </div>
          <p className="text-sm mt-2">{evaluator.bio}</p>
        </div>
      )}
    </div>
  );
};

export default EvaluatorProfile;
