import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="
        fixed bottom-20 lg:bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-lg 
        hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 active:scale-95
        z-40 flex items-center justify-center
        before:absolute before:inset-0 before:rounded-full before:ring-2 before:ring-primary before:animate-ping before:ring-opacity-50
      "
      size="icon"
      data-testid="fab-quick-check"
    >
      <Plus className="w-7 h-7 text-white relative z-10" />
    </Button>
  );
}
