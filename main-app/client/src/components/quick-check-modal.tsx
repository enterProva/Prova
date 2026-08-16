import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LinkCheckResult } from "@/services/linkChecker";

interface QuickCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckComplete: (result: LinkCheckResult) => void; // ✅ pass result back
}

export default function QuickCheckModal({ isOpen, onClose, onCheckComplete }: QuickCheckModalProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const checkLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/link-checks", { url });
      return response.json() as Promise<LinkCheckResult>; // ✅ typed
    },
    onSuccess: (data) => {
      toast({
        title: "Link Checked",
        description: "Your link has been analyzed successfully.",
      });
      setUrl("");
      onCheckComplete(data); // ✅ send the new record up
    },
    onError: () => {
      toast({
        title: "Check Failed",
        description: "Failed to check the link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheck = () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to check.",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url); // validate URL
      checkLinkMutation.mutate(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-quick-check">
        <DialogHeader className="relative pr-10">
          <DialogTitle data-testid="text-quick-check-title">
            Quick Link Check
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8 p-0"
            data-testid="button-close-modal"
            aria-label="Cancel quick link check"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="Paste link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
              data-testid="input-quick-check-url"
            />
          </div>
          
          <Button
            onClick={handleCheck}
            disabled={checkLinkMutation.isPending}
            className="w-full"
            data-testid="button-check-now"
          >
            <Search className="w-4 h-4 mr-2" />
            {checkLinkMutation.isPending ? "Checking..." : "Check Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
