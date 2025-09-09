import {
  LayoutDashboard,
  Target,
  User,
  Settings,
  TrendingUp,
  Calendar,
  LogOut,
  Plus,
  Flame,
  CheckCircle,
  Circle,
  LogIn,
  UserPlus,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export type IconName =
  | 'layoutDashboard'
  | 'target'
  | 'user'
  | 'settings'
  | 'trendingUp'
  | 'calendar'
  | 'logOut'
  | 'plus'
  | 'flame'
  | 'checkCircle'
  | 'circle'
  | 'logIn'
  | 'userPlus';

export const ICONS: Record<IconName, LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  target: Target,
  user: User,
  settings: Settings,
  trendingUp: TrendingUp,
  calendar: Calendar,
  logOut: LogOut,
  plus: Plus,
  flame: Flame,
  checkCircle: CheckCircle,
  circle: Circle,
  logIn: LogIn,
  userPlus: UserPlus,
};


