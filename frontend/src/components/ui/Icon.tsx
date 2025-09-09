import { ICONS, IconName } from './icons';
import { cn } from '@/lib/utils';

interface IconProps {
  name: IconName;
  className?: string;
}

export const Icon = ({ name, className }: IconProps) => {
  const Lucide = ICONS[name];
  if (!Lucide) return null;
  return <Lucide className={cn('h-5 w-5 text-foreground', className)} />;
};


