"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRoadmapState, type InitialRoadmapData } from "@/hooks/useRoadmapState";
import { GoalSetupCard } from "./roadmap/GoalSetupCard";
import { ResultHeroCard } from "./roadmap/ResultHeroCard";
import { AlgorithmDialog } from "./roadmap/AlgorithmDialog";
import { ScenarioCard } from "./roadmap/ScenarioCard";

interface RoadmapTabProps {
  initialData?: InitialRoadmapData | null;
  onSwitchTab?: (tab: string) => void;
}

export function RoadmapTab({ initialData, onSwitchTab }: RoadmapTabProps) {
  const { state, actions, computed } = useRoadmapState(initialData);
  const { result, status, maxPossibleGPA, combinations, scenarioText, retakeSuggestions } = computed;

  // Quản lý trạng thái đóng mở của các bước trong GoalSetupCard
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false
  });

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => {
      const isOpening = !prev[step];
      const newState = { ...prev, [step]: isOpening };
      
      // Nếu mở thẻ số 4 thì tự động đóng thẻ 2 và 3 để tiết kiệm không gian
      if (step === 4 && isOpening) {
        newState[2] = false;
        newState[3] = false;
      }
      
      return newState;
    });
  };

  const handleAddRetakeSuggestion = (suggestion: any) => {
    actions.addRetakesFromSuggestion(suggestion);
    // Tự động mở thẻ 4 và đóng thẻ 2, 3 khi bấm Áp dụng
    setExpandedSteps(prev => ({
      ...prev,
      4: true,
      2: false,
      3: false
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-4 sticky top-20 space-y-6 h-fit z-20 self-start"
      >
        <GoalSetupCard 
          state={state} 
          actions={actions} 
          computed={computed} 
          expandedSteps={expandedSteps}
          onToggleStep={toggleStep}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-8 space-y-3"
      >
        <ResultHeroCard
          result={result}
          status={status}
          maxPossibleGPA={maxPossibleGPA}
          targetGPA={state.targetGPA}
          currentCredits={state.currentCredits}
        />
        <AlgorithmDialog
          currentGPA={state.currentGPA}
          currentCredits={state.currentCredits}
          targetGPA={state.targetGPA}
          remainingCredits={state.remainingCredits}
          retakes={state.retakes}
          result={result}
        />
        <ScenarioCard
          scenarioText={scenarioText}
          combinations={combinations}
          result={result}
          retakeSuggestions={retakeSuggestions}
          hasManualData={computed.hasManualData}
          missingScenarios={computed.missingScenarios}
          targetGPA={state.targetGPA}
          totalPointsGap={computed.totalPointsGap}
          onAddRetakeSuggestion={handleAddRetakeSuggestion}
          onSwitchTab={onSwitchTab}
        />
      </motion.div>
    </div>
  );
}

