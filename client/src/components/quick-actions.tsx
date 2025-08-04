import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { exportChat } from "@/services/claude-api";

interface QuickActionsProps {
  sessionId: string | null;
  onActionClick: (action: string) => void;
}

export function QuickActions({ sessionId, onActionClick }: QuickActionsProps) {
  const { toast } = useToast();

  const handleExportChat = async () => {
    if (!sessionId) {
      toast({
        title: "No active chat",
        description: "Start a conversation first to export it.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportChat(sessionId);
      toast({
        title: "Chat exported",
        description: "Your conversation has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const quickActions = [
    {
      icon: 'fas fa-clock',
      title: 'Activity Timing',
      subtitle: 'Best times today',
      color: 'blue',
      action: 'timing'
    },
    {
      icon: 'fas fa-calendar-day',
      title: 'Tomorrow',
      subtitle: 'Forecast preview',
      color: 'green',
      action: 'forecast'
    },
    {
      icon: 'fas fa-thermometer',
      title: 'Symptoms',
      subtitle: 'Log how you feel',
      color: 'red',
      action: 'symptoms'
    },
    {
      icon: 'fas fa-download',
      title: 'Export Chat',
      subtitle: 'Save conversation',
      color: 'purple',
      action: 'export'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="px-4 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.action}
            variant="outline"
            className="bg-white border border-gray-200 rounded-xl p-4 h-auto hover:shadow-md transition-shadow"
            onClick={() => action.action === 'export' ? handleExportChat() : onActionClick(action.action)}
          >
            <div className="text-center w-full">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${getColorClasses(action.color)}`}>
                <i className={action.icon}></i>
              </div>
              <span className="text-sm font-medium text-gray-900 block">{action.title}</span>
              <p className="text-xs text-gray-600 mt-1">{action.subtitle}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
