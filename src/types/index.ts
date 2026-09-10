import type { NotionPage, NotionDatabase } from './notion';
export * from './notion';

export type TabType = 
  | 'workspace' 
  | 'home' 
  | 'desktops' 
  | 'cycle' 
  | 'tasks' 
  | 'pills' 
  | 'water' 
  | 'finance' 
  | 'settings' 
  | 'notion_page' 
  | 'notion_database';

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
  finance?: DualColorTheme; // optional override for Finance
}

/* ==========================================
   WIDGETS CONFIGURATION / НАСТРОЙКА ВИДЖЕТОВ
   ========================================== */

export type WidgetType = 'cycle' | 'tasks' | 'water' | 'pills' | 'tip' | 'divider' | 'photo' | 'clock' | 'finance';
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
  isCourse?: boolean;
  courseStartDate?: string;    // YYYY-MM-DD
  courseDurationDays?: number; // e.g. 7, 10, 14, 21, 30, 60, 90
  courseEndDate?: string;      // YYYY-MM-DD
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
   FINANCE & EXPENSE/INCOME TRACKER TYPES
   ========================================== */

export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 
  | 'card'          // Дебетовая карта
  | 'cash'          // Наличные (кошелек, конверт)
  | 'savings'       // Заначка, накопительный счет, копилка
  | 'credit_card'   // Кредитная карта (с лимитом и льготным периодом)
  | 'loan'          // Кредит / Рассрочка / Ипотека
  | 'debt';         // Долг / Заем

export interface FinancialAccount {
  id: string;
  name: string; // e.g. "Тинькофф Black", "Заначка на отпуск", "Кредитка 120 дней"
  type: AccountType;
  balance: number; // Текущий баланс (для карт/наличных/копилок) или текущий остаток долга (для кредитов/кредиток)
  currency: string; // '₽', '$', '€', '₸', 'Br'
  color?: string; // hex color or gradient name
  icon?: string; // Icon identifier
  targetAmount?: number; // Целевая сумма для заначки/копилки
  targetDate?: string; // Желаемая дата накопления (YYYY-MM-DD)
  
  // Поля для кредитов, кредитных карт и рассрочек:
  creditLimit?: number; // Кредитный лимит (например 100 000 ₽)
  monthlyPayment?: number; // Минимальный платеж или ежемесячный взнос (например 4 500 ₽)
  paymentDueDay?: number; // День месяца для обязательного платежа (1-31)
  nextPaymentDate?: string; // Ближайшая точная дата платежа (YYYY-MM-DD)
  gracePeriodDays?: number; // Дней без процентов (например 55, 120)
  interestRate?: number; // Процентная ставка (% годовых)
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  title?: string;
  account?: string; // Название счета (обратная совместимость)
  accountId?: string; // ID исходного счета
  toAccountId?: string; // ID целевого счета (для переводов)
  createdAt: string;
}

export interface CategoryBudget {
  category: string;
  limit: number;
}

export interface FinanceSettings {
  currency: string; // '₽', '$', '€', '₸', 'Br' (default '₽')
  monthlyBudgetLimit?: number; // e.g. 60000
  categoryBudgets?: CategoryBudget[];
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
  transactions?: FinancialTransaction[];
  accounts?: FinancialAccount[];
  financeSettings?: FinanceSettings;
  pages?: NotionPage[];
  databases?: NotionDatabase[];
  notificationSettings: NotificationSettings;
}
