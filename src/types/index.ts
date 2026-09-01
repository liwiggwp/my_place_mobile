export type TabType = 'home' | 'desktops' | 'cycle' | 'tasks' | 'pills' | 'water' | 'settings';

/* ==========================================
   THEME SETTINGS / НАСТРОЙКА ЦВЕТОВЫХ ТЕМ
   ========================================== */

export interface DualColorTheme {
  primary: string;    // e.g. '#203A5F'
  secondary: string;  // e.g. '#595959'
}

export interface AppThemeSettings {
  global: DualColorTheme;
  cycle?: DualColorTheme;   // optional override for Cycle
  tasks?: DualColorTheme;   // optional override for Tasks
  water?: DualColorTheme;   // optional override for Water
  pills?: DualColorTheme;   // optional override for Pills
}

/* ==========================================
   WIDGETS CONFIGURATION / НАСТРОЙКА ВИДЖЕТОВ
   ========================================== */

export type WidgetType = 'cycle' | 'tasks' | 'water' | 'pills' | 'tip' | 'divider' | 'photo' | 'clock';
export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetConfig {
  id: string;              // unique ID (e.g. 'cycle', 'tasks', 'water', 'photo-1', 'divider-1')
  type: WidgetType;        // type of widget
  title: string;
  enabled: boolean;
  size: WidgetSize;
  order: number;
  row: number;             // iOS 18 2D Grid Row (0, 1, 2, 3...)
  col: 0 | 1;              // iOS 18 Grid Col: 0 (Left), 1 (Right)
  dividerStyle?: 'blank' | 'line';
  imageUrl?: string;       // Base64 data URL for photo widget
  imageCaption?: string;   // Optional photo caption
  taskCategoryFilter?: string; // Optional task category filter for tasks widgets on desktops
}

export interface DashboardDesktop {
  id: string;
  name: string;
  icon?: string;
  widgets: WidgetConfig[];
}

/* ==========================================
   TASKS / ЗАДАЧИ И ПЛАНИРОВАНИЕ
   ========================================== */

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = string;
export type TaskViewMode = 'day' | 'week' | 'month';

export interface TaskCategoryItem {
  id: string;
  label: string;
  icon?: string;
  color?: string; // Tailwind color class or hex
  isDefault?: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (e.g. "14:30")
  reminderMinutesBefore?: number; // 0, 5, 10, 15, 30, 60
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  subtasks: SubTask[];
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
}

/* ==========================================
   USER PROFILE / ЛИЧНЫЙ КАБИНЕТ
   ========================================== */

export type UserGoal = 
  | 'track_cycle'          // Отслеживание цикла
  | 'plan_pregnancy'       // Планирование беременности
  | 'prevent_pregnancy'    // Предотвращение беременности
  | 'health_habits';       // Здоровье и водный баланс

export type ContraceptionMethod = 
  | 'pills'                // Противозачаточные (КОК)
  | 'condoms'              // Презервативы
  | 'iud'                  // ВМС (спираль)
  | 'patch_ring'           // Пластырь / НоваРинг
  | 'implants'             // Имплант / Инъекции
  | 'none'                 // Без контрацепции
  | 'other';               // Другое

export interface UserProfile {
  name: string;
  avatarEmoji: string;     // e.g. "🌸", "🦋", "🐱", "✨", "🌺", "🌙", "👑"
  age?: number;
  height?: number;         // in cm
  weight?: number;         // in kg
  goal: UserGoal;
  contraception: ContraceptionMethod;
  notes?: string;
  updatedAt?: string;
}

/* ==========================================
   CYCLE TRACKER & INTIMACY TYPES
   ========================================== */

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MoodType = 
  | 'happy' 
  | 'calm' 
  | 'energized' 
  | 'sensitive' 
  | 'irritated' 
  | 'sad' 
  | 'tired' 
  | 'anxious'
  | 'romantic';

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

export type SexActivity = 'none' | 'protected' | 'unprotected' | 'high_drive';

export type IntimacyType = 'protected' | 'unprotected' | 'oral_other' | 'solo';
export type OrgasmStatus = 'yes' | 'multiple' | 'no';
export type LibidoLevel = 'calm' | 'moderate' | 'high' | 'very_high';

export interface IntimacyLog {
  hadSex: boolean;
  type: IntimacyType;
  timesCount: number;         // 1, 2, 3+
  orgasm: OrgasmStatus;
  libido: LibidoLevel;
  protectionNotes?: string;   // e.g. "Презерватив", "КОК", "Экстренная контрацепция"
  notes?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  flow?: FlowLevel;
  moods: MoodType[];
  symptoms: SymptomType[];
  sexActivity?: SexActivity;
  intimacy?: IntimacyLog;
  temperature?: number;
  weight?: number;
  notes?: string;
}

export interface CyclePeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD (empty if ongoing)
  length?: number;   // Days of bleeding
}

export interface CycleSettings {
  averageCycleLength: number; // usually 28
  averagePeriodLength: number; // usually 5
  lutealPhaseLength: number; // usually 14
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
  pregnancyChance: 'low' | 'medium' | 'high';
}

/* ==========================================
   PILL TRACKER TYPES
   ========================================== */

export type PillCategory = 'pill' | 'vitamin' | 'contraceptive' | 'supplement' | 'other';

export type PillScheduleType = 
  | 'everyday' 
  | 'cycle_21_7' 
  | 'cycle_24_4' 
  | 'every_other_day' 
  | 'custom_days';

export interface Pill {
  id: string;
  name: string;
  dosage: string;
  category: PillCategory;
  times: string[];
  scheduleType: PillScheduleType;
  customDays?: number[];
  cycleDayStart?: string;
  color: string;
  iconName?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export type PillStatus = 'taken' | 'skipped' | 'snoozed';

export interface PillLog {
  id: string;
  pillId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // "09:00"
  status: PillStatus;
  takenAt?: string;
}

/* ==========================================
   WATER TRACKER TYPES
   ========================================== */

export type DrinkType = 'water' | 'tea' | 'coffee' | 'juice' | 'electrolytes' | 'other';

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ml
  type: DrinkType;
  timestamp: string;
}

export interface WaterSettings {
  dailyGoal: number; // default 2000 ml
  reminderIntervalHours: number; // 1, 1.5, 2, 3
  reminderStartTime: string; // "08:00"
  reminderEndTime: string; // "22:00"
  enabledReminders: boolean;
  glassSize: number; // default 250
}

/* ==========================================
   GENERAL & NOTIFICATIONS
   ========================================== */

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  pillReminders: boolean;
  waterReminders: boolean;
  taskReminders?: boolean;
  cycleReminders: boolean;
  cycleReminderDaysBefore: number;
}

export interface AppData {
  userProfile: UserProfile;
  themeSettings?: AppThemeSettings;
  widgetsConfig: WidgetConfig[];
  customDesktops?: DashboardDesktop[];
  activeCustomDesktopId?: string;
  periods: CyclePeriod[];
  dayLogs: Record<string, DayLog>; // key: YYYY-MM-DD
  cycleSettings: CycleSettings;
  pills: Pill[];
  pillLogs: PillLog[];
  waterLogs: WaterLog[];
  waterSettings: WaterSettings;
  tasks: TaskItem[];
  taskCategories?: TaskCategoryItem[];
  notificationSettings: NotificationSettings;
}
