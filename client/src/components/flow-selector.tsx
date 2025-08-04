import { Button } from "@/components/ui/button";
import { getFlowDescription } from "@/data/scenarios";

interface FlowSelectorProps {
  selectedFlow: string;
  onFlowChange: (flow: string) => void;
}

const flows = ['Morning Check-in', 'Activity Planning', 'Bad Day Recovery'];

export function FlowSelector({ selectedFlow, onFlowChange }: FlowSelectorProps) {
  return (
    <div className="px-4 py-4 bg-gray-50 border-b">
      <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
        {flows.map((flow) => (
          <Button
            key={flow}
            variant={selectedFlow === flow ? "default" : "ghost"}
            size="sm"
            onClick={() => onFlowChange(flow)}
            className={`flex-1 text-xs font-medium rounded-md ${
              selectedFlow === flow
                ? 'bg-white text-blue-600 shadow-sm hover:bg-white'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            {flow}
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2 px-2">
        {getFlowDescription(selectedFlow)}
      </p>
    </div>
  );
}
