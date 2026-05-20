export type Role = 'worker' | 'supervisor';
export type DisplayMode = 'simplified' | 'complete';
export type SimplificationLevel = 'high' | 'medium' | 'low';
export type TextScale = 'standard' | 'large' | 'xlarge';
export type ContrastMode = 'standard' | 'high';
export type AnimationMode = 'calm' | 'reduced';
export type MessageChannel = 'message' | 'emergency' | 'routine' | 'emotion' | 'alert';

export interface Workshop {
  id: string;
  key: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive?: boolean;
  workerCount?: number;
  pictogramCount?: number;
}

export interface UserPreferences {
  displayMode: DisplayMode;
  speechRate: number;
  speechVolume: number;
  showSearch: boolean;
  textScale: TextScale;
  contrastMode: ContrastMode;
  animationMode: AnimationMode;
}

export interface Category {
  id: string;
  key: string;
  name: string;
  prompt: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}

export interface Pictogram {
  id: string;
  key: string;
  label: string;
  phrase: string;
  spokenText: string;
  builderText: string;
  keywords: string[];
  category: Category;
  workshops: Workshop[];
  imageUrl: string;
  color: string;
  showInSimplified: boolean;
  isActive: boolean;
  sourceLabel: string;
}

export interface RoutineStep {
  title: string;
  instruction: string;
  audioText: string;
  order: number;
  pictogram?: Pictogram | null;
}

export interface RoutineProgress {
  status: 'assigned' | 'in_progress' | 'completed';
  currentStepIndex: number;
  completedStepIndexes: number[];
  progressPercent?: number;
  lastStartedAt?: string | null;
  lastCompletedAt?: string | null;
}

export interface Routine {
  id: string;
  key: string;
  title: string;
  description: string;
  category?: Category | null;
  workshop?: Workshop | null;
  estimatedMinutes: number;
  difficulty: 'facile' | 'moyen' | 'avance';
  supportText: string;
  isActive: boolean;
  steps: RoutineStep[];
  assignedTo?: User[];
  assignment?: RoutineProgress;
}

export interface UserRoutineAssignment extends RoutineProgress {
  routine: Routine;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  email: string;
  avatar: string;
  simplificationLevel: SimplificationLevel;
  supportNeeds: string[];
  assignedWorkshop?: Workshop | null;
  routineAssignments?: UserRoutineAssignment[];
  preferences: UserPreferences;
  favoriteCount?: number;
  historyCount?: number;
  routineCount?: number;
  activeRoutineCount?: number;
  lastLoginAt?: string | null;
}

export interface Favorite {
  id: string;
  kind: 'pictogram' | 'phrase';
  title: string;
  text: string;
  imageUrl: string;
  pictogram?: Pictogram | null;
  pictograms?: Pictogram[];
}

export interface MessageItem {
  pictogramId?: string | null;
  key?: string;
  pictogram?: Pictogram | null;
  label: string;
  builderText: string;
  imageUrl: string;
  color: string;
}

export interface MessagePictogram {
  id?: string | null;
  key?: string;
  label: string;
  imageUrl: string;
  color: string;
  builderText?: string;
}

export interface Message {
  id: string;
  worker?: User;
  workerId?: string | null;
  workerName?: string;
  workshop?: Workshop | null;
  items: MessageItem[];
  pictograms?: MessagePictogram[];
  text: string;
  channel: MessageChannel;
  status?: 'sent';
  speechRate: number;
  speechVolume: number;
  createdAt: string;
}

export interface Alert {
  id: string;
  workerId: User;
  type: string;
  priority: 'normal' | 'important' | 'urgent';
  message: string;
  status: 'pending' | 'seen' | 'resolved';
  responseNote?: string;
  respondedBy?: User | null;
  respondedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  worker: User;
  workerName?: string;
  workshop?: Workshop | null;
  message?: Message | null;
  routine?: Routine | null;
  text: string;
  channel: MessageChannel;
  status?: string;
  createdAt: string;
}

export interface DashboardSummary {
  metrics: {
    workersCount: number;
    pictogramsCount: number;
    workshopsCount: number;
    messagesCount: number;
    simplifiedProfiles: number;
    pendingAlerts: number;
    activeRoutines: number;
    completedRoutineEntries: number;
  };
  recentHistory: HistoryEntry[];
  recentPictograms: Pictogram[];
  recentAlerts: Alert[];
}

export interface LoginResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthStorage {
  accessToken: string;
  refreshToken: string;
}

export interface ComposerItem {
  clientId: string;
  sourceId: string;
  label: string;
  builderText: string;
  imageUrl: string;
  color: string;
}

export interface NoticeState {
  tone: 'success' | 'error';
  text: string;
  detail?: string;
}

export interface MessageCreateResponse {
  success: boolean;
  message: Message;
}
