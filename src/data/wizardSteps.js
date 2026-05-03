import {
  ClipboardList,
  FileEdit,
  Search,
  IdCard,
  CalendarDays,
  PartyPopper,
} from "lucide-react";
import { Step1Eligibility } from "../components/voter-journey/steps/Step1Eligibility";
import { Step2Register } from "../components/voter-journey/steps/Step2Register";
import { Step3VerifyList } from "../components/voter-journey/steps/Step3VerifyList";
import { Step4VoterID } from "../components/voter-journey/steps/Step4VoterID";
import { Step5PollingDay } from "../components/voter-journey/steps/Step5PollingDay";
import { Step6Complete } from "../components/voter-journey/steps/Step6Complete";

export const WIZARD_STEPS = [
  {
    id: 1,
    title: "Check Eligibility",
    icon: ClipboardList,
    color: "text-green-400",
    bgColor: "bg-green-400/20",
    Content: Step1Eligibility,
  },
  {
    id: 2,
    title: "Register as a Voter",
    icon: FileEdit,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    Content: Step2Register,
  },
  {
    id: 3,
    title: "Verify Your Name",
    icon: Search,
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    Content: Step3VerifyList,
  },
  {
    id: 4,
    title: "Your Voter ID",
    icon: IdCard,
    color: "text-orange-400",
    bgColor: "bg-orange-400/20",
    Content: Step4VoterID,
  },
  {
    id: 5,
    title: "Polling Day Guide",
    icon: CalendarDays,
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    Content: Step5PollingDay,
  },
  {
    id: 6,
    title: "You're Ready!",
    icon: PartyPopper,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    Content: Step6Complete,
  },
];
