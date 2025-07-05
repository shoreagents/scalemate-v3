'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorStep } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  RotateCcw, 
  Play, 
  X, 
  Clock, 
  MapPin, 
  Users, 
  Target,
  TrendingUp
} from 'lucide-react';

interface RestoreProgressPopupProps {
  isOpen: boolean;
  onRestore: () => void;
  onRestart: () => void;
  onDismiss: () => void;
  cachedStep: CalculatorStep;
  cachedData?: {
    portfolioSize?: string;
    selectedRolesCount?: number;
    location?: string;
  };
}

const getStepInfo = (step: CalculatorStep) => {
  switch (step) {
    case 1:
      return { title: 'Portfolio Selection', icon: MapPin, description: 'Property portfolio details' };
    case 2:
      return { title: 'Role Selection', icon: Users, description: 'Team roles and responsibilities' };
    case 3:
      return { title: 'Task Selection', icon: Target, description: 'Specific tasks and activities' };
    case 4:
      return { title: 'Experience Level', icon: TrendingUp, description: 'Team experience requirements' };
    case 5:
      return { title: 'Location Setup', icon: MapPin, description: 'Geographic and currency settings' };
    case 6:
      return { title: 'Results', icon: Target, description: 'Savings calculation and recommendations' };
    default:
      return { title: 'Calculator', icon: MapPin, description: 'Progress saved' };
  }
};

export function RestoreProgressPopup({
  isOpen,
  onRestore,
  onRestart,
  onDismiss,
  cachedStep,
  cachedData
}: RestoreProgressPopupProps) {
  const stepInfo = getStepInfo(cachedStep);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px] overflow-hidden"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg"
          >
            <Card className="relative overflow-hidden">
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-brand-primary-50 to-brand-primary-100 border-b border-brand-primary-200">
                
                <div className="flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-brand-primary-900 mb-2">
                  Welcome back!
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 text-center">
                We saved your progress from your last session. You can continue where you left off or start fresh—whatever works best for you.
                </p>

              </div>

              {/* Content */}
              <div className="p-6">
                {/* Progress indicator */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((cachedStep / 6) * 100)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(cachedStep / 6) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={onRestart}
                    variant="quantum-secondary"
                    size="neural-lg"
                    fullWidth
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={onRestore}
                    variant="neural-primary"
                    size="neural-lg"
                    fullWidth
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    Continue Progress
                  </Button>
                </div>


              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 