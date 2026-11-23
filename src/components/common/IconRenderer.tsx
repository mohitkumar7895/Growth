import React from "react";
import {
  Compass,
  ShieldCheck,
  MapPinned,
  Handshake,
  Home,
  Building2,
  Factory,
  Map,
  KeyRound,
  Landmark,
  TrendingUp,
  ArrowLeftRight,
  FileSignature,
  UserCheck,
  MessageSquareText,
  HeartHandshake,
  Award,
  Building,
  Briefcase,
  Sparkles,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  ShieldCheck,
  MapPinned,
  Handshake,
  Home,
  Building2,
  Factory,
  Map,
  KeyRound,
  Landmark,
  TrendingUp,
  ArrowLeftRight,
  FileSignature,
  UserCheck,
  MessageSquareText,
  HeartHandshake,
  Award,
  Building,
  Briefcase,
  Sparkles,
};

export function DynamicIcon({
  name,
  className = "h-5 w-5",
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICON_MAP[name]) || Building2;
  return <Icon className={className} aria-hidden="true" />;
}
