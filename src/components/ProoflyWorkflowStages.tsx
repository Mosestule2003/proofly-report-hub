
import React from 'react';
import { 
  Home,
  ShoppingCart, 
  PhoneCall, 
  CheckCircle, 
  Users, 
  Camera, 
  FileText, 
  Check 
} from 'lucide-react';

interface StageProps {
  title: string;
  description: string;
  icon: React.ElementType;
  isActive?: boolean;
  isCompleted?: boolean;
}

const Stage: React.FC<StageProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  isActive = false,
  isCompleted = false 
}) => {
  return (
    <div 
      className={`flex flex-col items-center ${isActive ? 'group' : ''}`}
      aria-label={`Stage: ${title}`}
    >
      <div 
        className={`
          relative z-10 w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isCompleted ? 'bg-[#FF5A5F]' : isActive ? 'bg-[#FF5A5F]' : 'bg-transparent border-2 border-gray-400/50'}
        `}
      >
        {isCompleted ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
        )}
      </div>
      <div className={`mt-3 text-center max-w-[130px] transition-all duration-300`}>
        <h4 className={`text-sm font-semibold uppercase ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
          {title}
        </h4>
        <p className={`text-xs mt-1 ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

interface StageRowProps {
  title: string;
  stages: StageProps[];
}

const StageRow: React.FC<StageRowProps> = ({ title, stages }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="uppercase text-gray-900 text-sm font-bold mb-6">
        {title}
      </div>
      <div className="relative flex justify-between w-full mb-10">
        {/* Connecting Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300/50 -z-0" />
        
        {/* Stages */}
        {stages.map((stage, index) => (
          <Stage key={index} {...stage} />
        ))}
      </div>
    </div>
  );
};

export const ProoflyWorkflowStages: React.FC = () => {
  const preparationStages: StageProps[] = [
    {
      title: "Add a Property",
      description: "Paste address & landlord info → Add to Cart",
      icon: Home,
      isCompleted: true
    },
    {
      title: "View Your Cart",
      description: "Review items, note fees, bulk-discount applied",
      icon: ShoppingCart,
      isActive: true
    }
  ];

  const startStages: StageProps[] = [
    {
      title: "AI Outreach In Progress",
      description: "\"Calling Landlords...\" status screen",
      icon: PhoneCall
    },
    {
      title: "Confirmed Bookings",
      description: "Display success and next instructions",
      icon: CheckCircle
    }
  ];

  const finishStages: StageProps[] = [
    {
      title: "Local Proofly \"Friend\" Steps In",
      description: "On-ground friend matched to visit",
      icon: Users
    },
    {
      title: "Walkthrough & Report",
      description: "Photos, video, notes captured",
      icon: Camera
    },
    {
      title: "View Your Report",
      description: "Final report delivered in dashboard",
      icon: FileText
    }
  ];

  return (
    <div className="bg-white py-16 px-6 rounded-xl shadow-lg">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Stages of Work</h2>
        
        {/* Desktop View */}
        <div className="hidden md:block">
          <StageRow title="Preparation" stages={preparationStages} />
          <StageRow title="Start" stages={startStages} />
          <StageRow title="Finish" stages={finishStages} />
        </div>
        
        {/* Mobile View */}
        <div className="md:hidden space-y-8">
          <div className="space-y-4">
            <h3 className="uppercase text-gray-900 text-sm font-bold">Preparation</h3>
            <div className="relative pl-8 space-y-8">
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300/50"></div>
              
              {preparationStages.map((stage, index) => (
                <div key={index} className="flex items-start">
                  <div 
                    className={`
                      absolute left-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${stage.isCompleted ? 'bg-[#FF5A5F]' : stage.isActive ? 'bg-[#FF5A5F]' : 'bg-transparent border-2 border-gray-400/50'}
                    `}
                  >
                    {stage.isCompleted ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <stage.icon className={`w-3 h-3 ${stage.isActive ? 'text-white' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <div className="ml-6">
                    <h4 className={`text-sm font-semibold uppercase ${stage.isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                      {stage.title}
                    </h4>
                    <p className={`text-xs mt-1 ${stage.isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="uppercase text-gray-900 text-sm font-bold">Start</h3>
            <div className="relative pl-8 space-y-8">
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300/50"></div>
              
              {startStages.map((stage, index) => (
                <div key={index} className="flex items-start">
                  <div 
                    className={`
                      absolute left-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${stage.isCompleted ? 'bg-[#FF5A5F]' : stage.isActive ? 'bg-[#FF5A5F]' : 'bg-transparent border-2 border-gray-400/50'}
                    `}
                  >
                    {stage.isCompleted ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <stage.icon className={`w-3 h-3 ${stage.isActive ? 'text-white' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <div className="ml-6">
                    <h4 className={`text-sm font-semibold uppercase ${stage.isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                      {stage.title}
                    </h4>
                    <p className={`text-xs mt-1 ${stage.isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="uppercase text-gray-900 text-sm font-bold">Finish</h3>
            <div className="relative pl-8 space-y-8">
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300/50"></div>
              
              {finishStages.map((stage, index) => (
                <div key={index} className="flex items-start">
                  <div 
                    className={`
                      absolute left-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${stage.isCompleted ? 'bg-[#FF5A5F]' : stage.isActive ? 'bg-[#FF5A5F]' : 'bg-transparent border-2 border-gray-400/50'}
                    `}
                  >
                    {stage.isCompleted ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <stage.icon className={`w-3 h-3 ${stage.isActive ? 'text-white' : 'text-gray-600'}`} />
                    )}
                  </div>
                  <div className="ml-6">
                    <h4 className={`text-sm font-semibold uppercase ${stage.isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                      {stage.title}
                    </h4>
                    <p className={`text-xs mt-1 ${stage.isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
