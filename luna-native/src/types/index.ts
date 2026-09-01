export type TabType = 'cycle' | 'pills' | 'water' | 'settings';

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MoodType = 
  | 'happy' 
  | 'calm' 
  | 'energized' 
  | 'romantic' 
  | 'sensitive' 
  | 'irritated' 
  | 'sad' 
  | 'tired' 
  | 'anxious';

export type SymptomType = 
  | 'cramps' 
  | 'headache' 
  | 'bloating' 
  | 'backache' 
  | 'tender_breasts' 
  | 'acne' 
  | 'insomnia' 
  | 'cravings'
  | 'nausea'
  | 'fatigue';

export interface DayLog {
  date: string; // YYYY-MM-DD
  flow?: FlowLevel;
  moods: MoodType[];
  symptoms: SymptomType[];
  notes?: string;
}

export interface CyclePeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  length?: number;
}

export interface CycleSettings {
  averageCycleLength: number; // default 28
  averagePeriodLength: number; // default 5
  lutealPhaseLength: number; // default 14
}

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

export interface CyclePrediction {
  currentDayOfCycle: number;
  currentPhase: CyclePhase;
  phaseName: string;
  phaseDescription: string;
  daysUntilNextPeriod: number;
  nextPeriodStartDate: string;
  nextPeriodEndDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  pregnancyChance: 'low' | 'high';
}

export type PillCategory = 'pill' | 'vitamin' | 'contraceptive' | 'supplement';

export interface Pill {
  id: string;
  name: string;
  dosage: string;
  category: PillCategory;
  times: string[]; // ["09:00", "21:30"]
  color: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export type PillStatus = 'taken' | 'skipped';

export interface PillLog {
  id: string;
  pillId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // "09:00"
  status: PillStatus;
  takenAt?: string;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ml
  timestamp: string;
}

export interface WaterSettings {
  dailyGoal: number; // default 2000 ml
  reminderIntervalHours: number; // 2
  reminderStartTime: string; // "08:30"
  reminderEndTime: string; // "22:00"
  enabledReminders: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  pillReminders: boolean;
  waterReminders: boolean;
  cycleReminders: boolean;
}

export interface AppData {
  periods: CyclePeriod[];
  dayLogs: Record<string, DayLog>;
  cycleSettings: CycleSettings;
  pills: Pill[];
  pillLogs: PillLog[];
  waterLogs: WaterLog[];
  waterSettings: WaterSettings;
  notificationSettings: NotificationSettings;
}
