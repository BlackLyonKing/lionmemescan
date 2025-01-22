import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  tokenName: string;
}

export const AIAnalysisDialog = ({ isOpen, onClose, analysis, tokenName }: AIAnalysisDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <img src="/lovable-uploads/df159513-b991-4d4b-94be-6cbde5eae80c.png" alt="AI Agent" />
            </Avatar>
            <DialogTitle>Analysis for {tokenName}</DialogTitle>
          </div>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh]">
          <div className="space-y-4">
            <div className="bg-background/40 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{analysis}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};