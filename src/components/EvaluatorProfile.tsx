
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
const EvaluatorProfile: React.FC<{ evaluator: Evaluator }> = ({ evaluator }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <Avatar className="w-20 h-20">
            <AvatarImage src={evaluator.avatarUrl} alt={evaluator.name} />
            <AvatarFallback>{evaluator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-semibold text-lg">{evaluator.name}</h3>
            
            <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(evaluator.rating) ? "text-yellow-400" : "text-gray-300"}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium">{evaluator.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({evaluator.evaluationsCompleted} evaluations)
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-2">
              {evaluator.bio}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluatorProfile;
