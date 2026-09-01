import { useState } from 'react';
import type {
  TabType,
  AppData,
  CyclePeriod,
  DayLog,
  Pill,
  PillLog,
  PillStatus,
  WaterLog,
  DrinkType,
  UserProfile,
  WidgetConfig,
  AppThemeSettings,
  TaskItem,
  TaskCategoryItem
} from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useNotifications } from './hooks/useNotifications';
import { getCyclePrediction, getLatestPeriod } from './utils/cycleCalculations';
import { addDays, getTodayString } from './utils/dateUtils';
import { defaultThemeSettings, getScreenTheme } from './utils/themeUtils';
import confetti from 'canvas-confetti';

// Layout Components
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { NotificationBanner } from './components/layout/NotificationBanner';
import { InstallPrompt } from './components/layout/InstallPrompt';

// Home Dashboard
import { HomeDashboard, defaultWidgetsConfig } from './components/home/HomeDashboard';

// Cycle Components
import { CycleHero } from './components/cycle/CycleHero';
import { CycleCalendar } from './components/cycle/CycleCalendar';
import { CycleStats } from './components/cycle/CycleStats';
import { SymptomModal } from './components/cycle/SymptomModal';

// Tasks Components
import { TasksView } from './components/tasks/TasksView';
import { TaskModal } from './components/tasks/TaskModal';
import { ManageCategoriesModal } from './components/tasks/ManageCategoriesModal';

// Pill Components
import { PillSummary } from './components/pills/PillSummary';
import { PillCard } from './components/pills/PillCard';
import { PillModal } from './components/pills/PillModal';

// Water Components
import { WaterWave } from './components/water/WaterWave';
import { WaterQuickAdd } from './components/water/WaterQuickAdd';
import { WaterLogList } from './components/water/WaterLogList';
import { WaterGoalModal } from './components/water/WaterGoalModal';

// Settings, Profile & Theme Components
import { SettingsView } from './components/settings/SettingsView';
import { OnboardingWizardModal } from './components/settings/OnboardingWizardModal';
import { DataImportModal } from './components/settings/DataImportModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { ThemeCustomizerModal } from './components/theme/ThemeCustomizerModal';

export const defaultTaskCategories: TaskCategoryItem[] = [
  { id: 'personal', label: 'Личное', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', isDefault: true },
  { id: 'work', label: 'Работа', color: 'bg-blue-50 text-blue-700 border-blue-200', isDefault: true },
  { id: 'health', label: 'Здоровье', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', isDefault: true },
  { id: 'shopping', label: 'Покупки', color: 'bg-amber-50 text-amber-700 border-amber-200', isDefault: true },
  { id: 'study', label: 'Учеба', color: 'bg-purple-50 text-purple-700 border-purple-200', isDefault: true },
  { id: 'other', label: 'Другое', color: 'bg-slate-50 text-slate-700 border-slate-200', isDefault: true }
];

const defaultInitialData: AppData = {
  userProfile: {
    name: 'Мой профиль',
    avatarEmoji: 'user',
    age: 25,
    height: 168,
    weight: 56,
    goal: 'track_cycle',
    contraception: 'condoms',
    notes: ''
  },
  themeSettings: defaultThemeSettings,
  widgetsConfig: defaultWidgetsConfig,
  periods: [
    {
      id: 'p-1',
      startDate: addDays(getTodayString(), -14),
      endDate: addDays(getTodayString(), -10),
      length: 5
    }
  ],
  dayLogs: {},
  cycleSettings: {
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lutealPhaseLength: 14
  },
  taskCategories: defaultTaskCategories,
  tasks: [
    {
      id: 'task-1',
      title: 'Утренняя разминка и стакан воды',
      description: 'Мягкая растяжка для бодрости и энергии',
      date: getTodayString(),
      time: '08:30',
      priority: 'medium',
      category: 'health',
      completed: true,
      subtasks: [
        { id: 'st-1', title: '5 минут разминки', completed: true },
        { id: 'st-2', title: 'Выпить 250 мл теплой воды', completed: true }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Прогулка на свежем воздухе',
      description: '30-40 минут спокойной ходьбы в парке',
      date: getTodayString(),
      time: '18:00',
      priority: 'high',
      category: 'personal',
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'Купить полезные продукты',
      description: 'Овощи, ягоды, орехи, зеленый чай',
      date: addDays(getTodayString(), 1),
      time: '14:00',
      priority: 'medium',
      category: 'shopping',
      completed: false,
      subtasks: [
        { id: 'st-3', title: 'Авокадо и шпинат', completed: false },
        { id: 'st-4', title: 'Миндаль', completed: false }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  pills: [
    {
      id: 'pill-1',
      name: 'Витамин D3',
      dosage: '2000 ME (1 капс.)',
      category: 'vitamin',
      times: ['09:00'],
      scheduleType: 'everyday',
      color: '#203A5F',
      notes: 'Во время завтрака',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'pill-2',
      name: 'Магний B6',
      dosage: '2 таблетки',
      category: 'supplement',
      times: ['21:30'],
      scheduleType: 'everyday',
      color: '#595959',
      notes: 'За 30 минут до сна',
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  pillLogs: [],
  waterLogs: [
    {
      id: 'w-1',
      date: getTodayString(),
      amount: 250,
      type: 'water',
      timestamp: new Date().toISOString()
    }
  ],
  waterSettings: {
    dailyGoal: 2000,
    reminderIntervalHours: 2,
    reminderStartTime: '08:30',
    reminderEndTime: '22:00',
    enabledReminders: true,
    glassSize: 250
  },
  notificationSettings: {
    enabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    pillReminders: true,
    waterReminders: true,
    taskReminders: true,
    cycleReminders: true,
    cycleReminderDaysBefore: 2
  }
};

export function App() {
  const [appData, setAppData] = useLocalStorage<AppData>('myplace_app_data_v3', defaultInitialData);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Modals state
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  const [isPillModalOpen, setIsPillModalOpen] = useState(false);
  const [pillToEdit, setPillToEdit] = useState<Pill | null>(null);
  const [isWaterGoalModalOpen, setIsWaterGoalModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDataImportOpen, setIsDataImportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);

  // Tasks modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string>(getTodayString());

  // Sound and Haptic
  const { playWaterDrop, playPillChime, playCelebration, playSoftClick, triggerVibrate } = useSoundEffects(
    appData.notificationSettings?.soundEnabled ?? true
  );

  // Notifications (with active tasks array passed)
  const {
    permission,
    requestPermission,
    testNotification,
    activeAlert,
    dismissAlert
  } = useNotifications(
    appData.notificationSettings,
    appData.pills,
    appData.pillLogs,
    appData.waterSettings,
    appData.tasks || []
  );

  const todayStr = getTodayString();
  const prediction = getCyclePrediction(appData.periods, appData.cycleSettings, selectedDate);
  const latestPeriod = getLatestPeriod(appData.periods);

  // User Profile & Themes
  const profile = appData.userProfile || defaultInitialData.userProfile;
  const globalTheme = getScreenTheme(appData.themeSettings, 'global');
  const cycleTheme = getScreenTheme(appData.themeSettings, 'cycle');
  const tasksTheme = getScreenTheme(appData.themeSettings, 'tasks');
  const waterTheme = getScreenTheme(appData.themeSettings, 'water');
  const pillsTheme = getScreenTheme(appData.themeSettings, 'pills');

  // Water calculations
  const todayWaterLogs = appData.waterLogs.filter(w => w.date === todayStr);
  const currentWaterTotal = todayWaterLogs.reduce((acc, w) => acc + w.amount, 0);

  // Pills calculations
  const pendingPillsCount = appData.pills.filter(p => p.active).reduce((acc, p) => {
    let pending = 0;
    p.times.forEach(t => {
      const isTaken = appData.pillLogs.some(
        l => l.pillId === p.id && l.date === todayStr && l.scheduledTime === t && l.status === 'taken'
      );
      if (!isTaken) pending++;
    });
    return acc + pending;
  }, 0);

  /* ==========================================
     CYCLE HANDLERS
     ========================================== */

  const handleTogglePeriodToday = () => {
    playSoftClick();
    triggerVibrate(30);

    const isOngoing = latestPeriod && !latestPeriod.endDate;

    if (isOngoing) {
      setAppData(prev => ({
        ...prev,
        periods: prev.periods.map(p =>
          p.id === latestPeriod.id ? { ...p, endDate: todayStr } : p
        )
      }));
    } else {
      const newPeriod: CyclePeriod = {
        id: 'p-' + Date.now(),
        startDate: todayStr
      };
      setAppData(prev => ({
        ...prev,
        periods: [newPeriod, ...prev.periods]
      }));
    }
  };

  const handleTogglePeriodStartOnDate = (dateStr: string) => {
    playSoftClick();
    const existing = appData.periods.find(p => p.startDate === dateStr);

    if (existing) {
      setAppData(prev => ({
        ...prev,
        periods: prev.periods.filter(p => p.id !== existing.id)
      }));
    } else {
      const newPeriod: CyclePeriod = {
        id: 'p-' + Date.now(),
        startDate: dateStr
      };
      setAppData(prev => ({
        ...prev,
        periods: [newPeriod, ...prev.periods]
      }));
    }
  };

  const handleSaveDayLog = (log: DayLog) => {
    playSoftClick();
    setAppData(prev => ({
      ...prev,
      dayLogs: {
        ...prev.dayLogs,
        [log.date]: log
      }
    }));
  };

  /* ==========================================
     TASKS HANDLERS
     ========================================== */

  const handleOpenAddTask = (defaultDate?: string) => {
    playSoftClick();
    setTaskToEdit(null);
    setTaskModalDefaultDate(defaultDate || todayStr);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    playSoftClick();
    setTaskToEdit(task);
    setTaskModalDefaultDate(task.date);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<TaskItem>) => {
    playSoftClick();
    setAppData(prev => {
      const existingTasks = prev.tasks || [];
      if (taskData.id) {
        return {
          ...prev,
          tasks: existingTasks.map(t =>
            t.id === taskData.id ? ({ ...t, ...taskData } as TaskItem) : t
          )
        };
      } else {
        const newTask: TaskItem = {
          id: 'task-' + Date.now(),
          title: taskData.title || 'Новая задача',
          description: taskData.description,
          date: taskData.date || todayStr,
          time: taskData.time,
          priority: taskData.priority || 'medium',
          category: taskData.category || 'personal',
          completed: false,
          subtasks: taskData.subtasks || [],
          repeat: taskData.repeat || 'none',
          createdAt: new Date().toISOString()
        };
        return {
          ...prev,
          tasks: [newTask, ...existingTasks]
        };
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    playSoftClick();
    setAppData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).filter(t => t.id !== taskId)
    }));
  };

  const handleToggleTask = (taskId: string) => {
    setAppData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setAppData(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return {
          ...t,
          subtasks: updatedSubtasks
        };
      })
    }));
  };

  const handleSaveCategories = (newCategories: TaskCategoryItem[]) => {
    playSoftClick();
    setAppData(prev => ({
      ...prev,
      taskCategories: newCategories
    }));
  };

  /* ==========================================
     PILL HANDLERS
     ========================================== */

  const handleLogPillStatus = (pillId: string, scheduledTime: string, status: PillStatus) => {
    if (status === 'taken') {
      playPillChime();
      triggerVibrate([40, 60, 40]);
    } else {
      playSoftClick();
    }

    setAppData(prev => {
      const filtered = prev.pillLogs.filter(
        l => !(l.pillId === pillId && l.date === todayStr && l.scheduledTime === scheduledTime)
      );

      const newLog: PillLog = {
        id: 'pl-' + Date.now(),
        pillId,
        date: todayStr,
        scheduledTime,
        status,
        takenAt: new Date().toISOString()
      };

      return {
        ...prev,
        pillLogs: [...filtered, newLog]
      };
    });
  };

  const handleSavePill = (pillData: Partial<Pill>) => {
    playSoftClick();
    setAppData(prev => {
      if (pillData.id) {
        return {
          ...prev,
          pills: prev.pills.map(p => (p.id === pillData.id ? ({ ...p, ...pillData } as Pill) : p))
        };
      } else {
        const newPill: Pill = {
          id: 'pill-' + Date.now(),
          name: pillData.name || 'Препарат',
          dosage: pillData.dosage || '1 табл.',
          category: pillData.category || 'pill',
          times: pillData.times || ['09:00'],
          scheduleType: pillData.scheduleType || 'everyday',
          color: pillData.color || globalTheme.primary,
          notes: pillData.notes || '',
          active: true,
          createdAt: new Date().toISOString()
        };
        return {
          ...prev,
          pills: [...prev.pills, newPill]
        };
      }
    });
  };

  const handleDeletePill = (pillId: string) => {
    playSoftClick();
    setAppData(prev => ({
      ...prev,
      pills: prev.pills.filter(p => p.id !== pillId),
      pillLogs: prev.pillLogs.filter(l => l.pillId !== pillId)
    }));
  };

  /* ==========================================
     WATER HANDLERS
     ========================================== */

  const handleAddWater = (amount: number, type: DrinkType = 'water') => {
    playWaterDrop();
    triggerVibrate(25);

    const newLog: WaterLog = {
      id: 'w-' + Date.now(),
      date: todayStr,
      amount,
      type,
      timestamp: new Date().toISOString()
    };

    const newTotal = currentWaterTotal + amount;
    if (newTotal >= appData.waterSettings.dailyGoal && currentWaterTotal < appData.waterSettings.dailyGoal) {
      playCelebration();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: [waterTheme.primary, waterTheme.secondary, '#38bdf8']
      });
    }

    setAppData(prev => ({
      ...prev,
      waterLogs: [newLog, ...prev.waterLogs]
    }));
  };

  const handleDeleteWaterLog = (id: string) => {
    playSoftClick();
    setAppData(prev => ({
      ...prev,
      waterLogs: prev.waterLogs.filter(w => w.id !== id)
    }));
  };

  /* ==========================================
     PROFILE, THEME, WIDGETS & ONBOARDING
     ========================================== */

  const handleSaveProfile = (newProfile: UserProfile, updateWaterGoal?: number) => {
    setAppData(prev => ({
      ...prev,
      userProfile: newProfile,
      ...(updateWaterGoal ? {
        waterSettings: {
          ...prev.waterSettings,
          dailyGoal: updateWaterGoal
        }
      } : {})
    }));
  };

  const handleSaveThemeSettings = (newThemeSettings: AppThemeSettings) => {
    setAppData(prev => ({
      ...prev,
      themeSettings: newThemeSettings
    }));
  };

  const handleSaveWidgetsConfig = (newConfig: WidgetConfig[]) => {
    setAppData(prev => ({
      ...prev,
      widgetsConfig: newConfig
    }));
  };

  const handleWizardComplete = (custom: Partial<AppData>) => {
    setAppData(prev => ({
      ...prev,
      ...custom,
      waterLogs: [],
      pillLogs: []
    }));
  };

  const handleImportPeriods = (importedPeriods: CyclePeriod[]) => {
    setAppData(prev => {
      const existingDates = new Set(prev.periods.map(p => p.startDate));
      const newOnly = importedPeriods.filter(p => !existingDates.has(p.startDate));
      return {
        ...prev,
        periods: [...newOnly, ...prev.periods].sort((a, b) => b.startDate.localeCompare(a.startDate))
      };
    });
  };

  const handleClearExamplesOnly = () => {
    if (confirm('Очистить тестовые примеры лекарств и сбросить счетчики на сегодня?')) {
      setAppData(prev => ({
        ...prev,
        pills: [],
        pillLogs: [],
        waterLogs: []
      }));
    }
  };

  /* ==========================================
     RENDER
     ========================================== */

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col justify-between max-w-md mx-auto relative antialiased selection:bg-slate-300">
      {/* Top Banner Alert */}
      <NotificationBanner alert={activeAlert} onDismiss={dismissAlert} />

      {/* Header */}
      <Header
        currentTab={currentTab}
        avatarEmoji={profile.avatarEmoji}
        theme={
          currentTab === 'cycle' ? cycleTheme :
          currentTab === 'tasks' ? tasksTheme :
          currentTab === 'water' ? waterTheme :
          currentTab === 'pills' ? pillsTheme : globalTheme
        }
        onOpenInstall={() => setIsInstallGuideOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onBackToHome={() => {
          playSoftClick();
          setCurrentTab('home');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 space-y-4 pb-safe-nav">
        {/* TAB 1: HOME WIDGETS DASHBOARD */}
        {currentTab === 'home' && (
          <HomeDashboard
            appData={appData}
            prediction={prediction}
            onNavigate={tab => {
              playSoftClick();
              setCurrentTab(tab);
            }}
            onQuickAddWater={amount => handleAddWater(amount, 'water')}
            onLogPillTaken={(pillId, scheduledTime) => handleLogPillStatus(pillId, scheduledTime, 'taken')}
            onOpenProfile={() => setIsProfileOpen(true)}
            onUpdateWidgets={handleSaveWidgetsConfig}
          />
        )}

        {/* SUB-SCREEN: FULL CYCLE */}
        {currentTab === 'cycle' && (
          <div className="space-y-4 animate-fade-in">
            <CycleHero
              prediction={prediction}
              latestPeriod={latestPeriod}
              theme={cycleTheme}
              onTogglePeriodToday={handleTogglePeriodToday}
              onOpenCalendar={() => {
                setSelectedDate(todayStr);
                setIsSymptomModalOpen(true);
              }}
              onOpenDataImport={() => setIsDataImportOpen(true)}
            />

            <CycleCalendar
              periods={appData.periods}
              settings={appData.cycleSettings}
              dayLogs={appData.dayLogs}
              selectedDate={selectedDate}
              onSelectDate={d => setSelectedDate(d)}
              onOpenSymptomModal={d => {
                setSelectedDate(d);
                setIsSymptomModalOpen(true);
              }}
            />

            <CycleStats
              prediction={prediction}
              periods={appData.periods}
              settings={appData.cycleSettings}
              dayLogs={appData.dayLogs}
            />
          </div>
        )}

        {/* SUB-SCREEN: FULL TASKS (DAY / WEEK / MONTH) */}
        {currentTab === 'tasks' && (
          <TasksView
            tasks={appData.tasks || []}
            theme={tasksTheme}
            categories={appData.taskCategories || defaultTaskCategories}
            notificationPermission={permission}
            onRequestPermission={requestPermission}
            onTestNotification={testNotification}
            onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
            onAddTask={handleOpenAddTask}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {/* SUB-SCREEN: FULL PILLS */}
        {currentTab === 'pills' && (
          <div className="space-y-4 animate-fade-in">
            <PillSummary
              pills={appData.pills}
              logs={appData.pillLogs}
              theme={pillsTheme}
              onOpenAddModal={() => {
                setPillToEdit(null);
                setIsPillModalOpen(true);
              }}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#595959]">
                  Список лекарств и витаминов ({appData.pills.filter(p => p.active).length})
                </h3>
              </div>

              {appData.pills.length === 0 ? (
                <div className="p-8 rounded-3xl glass-card text-center text-[#595959]">
                  <span className="text-4xl block mb-2">💊</span>
                  <p className="text-sm font-bold text-slate-800">Список пуст</p>
                  <p className="text-xs text-[#595959] mt-0.5">Добавьте витамины или таблетки для напоминаний</p>
                  <button
                    onClick={() => {
                      setPillToEdit(null);
                      setIsPillModalOpen(true);
                    }}
                    style={{ backgroundColor: pillsTheme.primary }}
                    className="mt-4 px-4 py-2 rounded-2xl text-white text-xs font-bold shadow-md shadow-slate-300 cursor-pointer"
                  >
                    + Добавить первый препарат
                  </button>
                </div>
              ) : (
                appData.pills.map(pill => (
                  <PillCard
                    key={pill.id}
                    pill={pill}
                    logs={appData.pillLogs}
                    onLogStatus={handleLogPillStatus}
                    onEdit={p => {
                      setPillToEdit(p);
                      setIsPillModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* SUB-SCREEN: FULL WATER */}
        {currentTab === 'water' && (
          <div className="space-y-4 animate-fade-in">
            <WaterWave
              currentAmount={currentWaterTotal}
              goalAmount={appData.waterSettings.dailyGoal}
              theme={waterTheme}
              onOpenGoalModal={() => setIsWaterGoalModalOpen(true)}
            />

            <WaterQuickAdd onAddWater={handleAddWater} />

            <WaterLogList logs={todayWaterLogs} onDeleteLog={handleDeleteWaterLog} />
          </div>
        )}

        {/* TAB 2: SETTINGS */}
        {currentTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingsView
              appData={appData}
              notificationPermission={permission}
              onRequestPermission={requestPermission}
              onTestNotification={testNotification}
              onUpdateNotifications={settings =>
                setAppData(prev => ({ ...prev, notificationSettings: settings }))
              }
              onImportData={data => setAppData(data)}
              onResetData={() => setAppData(defaultInitialData)}
              onClearExamplesOnly={handleClearExamplesOnly}
              onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
              onOpenWizard={() => setIsWizardOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        theme={globalTheme}
        onSelectTab={tab => {
          playSoftClick();
          setCurrentTab(tab);
        }}
        pendingPillsCount={pendingPillsCount}
      />

      {/* Modals */}
      <ThemeCustomizerModal
        isOpen={isThemeCustomizerOpen}
        themeSettings={appData.themeSettings}
        onSaveThemeSettings={handleSaveThemeSettings}
        onClose={() => setIsThemeCustomizerOpen(false)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={taskToEdit}
        defaultDate={taskModalDefaultDate}
        theme={tasksTheme}
        categories={appData.taskCategories || defaultTaskCategories}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        categories={appData.taskCategories || defaultTaskCategories}
        theme={tasksTheme}
        onSaveCategories={handleSaveCategories}
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      <SymptomModal
        isOpen={isSymptomModalOpen}
        dateStr={selectedDate}
        initialLog={appData.dayLogs[selectedDate]}
        isPeriodStart={appData.periods.some(p => p.startDate === selectedDate)}
        onTogglePeriodStart={handleTogglePeriodStartOnDate}
        onSaveLog={handleSaveDayLog}
        onClose={() => setIsSymptomModalOpen(false)}
      />

      <PillModal
        isOpen={isPillModalOpen}
        pillToEdit={pillToEdit}
        onSave={handleSavePill}
        onDelete={handleDeletePill}
        onClose={() => setIsPillModalOpen(false)}
      />

      <WaterGoalModal
        isOpen={isWaterGoalModalOpen}
        settings={appData.waterSettings}
        onSave={newSettings =>
          setAppData(prev => ({ ...prev, waterSettings: newSettings }))
        }
        onClose={() => setIsWaterGoalModalOpen(false)}
      />

      <InstallPrompt
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      <OnboardingWizardModal
        isOpen={isWizardOpen}
        onComplete={handleWizardComplete}
        onClose={() => setIsWizardOpen(false)}
      />

      <DataImportModal
        isOpen={isDataImportOpen}
        theme={cycleTheme}
        onImportPeriods={handleImportPeriods}
        onClose={() => setIsDataImportOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
