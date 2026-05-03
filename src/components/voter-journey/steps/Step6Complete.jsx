import { Download, Share2, PartyPopper } from "lucide-react";
import { Button } from "../../ui/Button";

export function Step6Complete() {
  return (
    <div className="text-center space-y-6 py-6">
      <div className="w-20 h-20 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto">
        <PartyPopper size={40} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          You're an Informed Voter!
        </h3>
        <p className="text-slate-600 dark:text-white/60 text-sm mt-2 max-w-xs mx-auto">
          You have learned the complete process of voting in India. Your vote is
          your voice.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button variant="outline" icon={<Share2 size={16} />}>
          Share Journey
        </Button>
        <Button variant="primary" icon={<Download size={16} />}>
          Download Checklist
        </Button>
      </div>
    </div>
  );
}
