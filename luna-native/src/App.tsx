import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import type {
  TabType,
  AppData,
  CyclePeriod,
  Pill,
  PillStatus,
  DrinkType,
} from './types';
import { getCyclePrediction, getTodayString, addDays } from './utils/cycleMath';
import { useWidgetSync } from './hooks/useWidgetSync';
import { useNotifications } from './hooks/useNotifications';

const { width } = Dimensions.get('window');

const STORAGE_KEY = 'luna_native_app_data_v1';

const defaultData: AppData = {
  periods: [
    {
      id: 'p-1',
      startDate: addDays(getTodayString(), -14),
      endDate: addDays(getTodayString(), -10),
      length: 5,
    },
  ],
  dayLogs: {},
  cycleSettings: {
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lutealPhaseLength: 14,
  },
  pills: [
    {
      id: 'pill-1',
      name: 'Витамин D3',
      dosage: '2000 ME (1 капс.)',
      category: 'vitamin',
      times: ['09:00'],
      color: '#f59e0b',
      notes: 'Во время завтрака',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pill-2',
      name: 'Магний B6',
      dosage: '2 таблетки',
      category: 'supplement',
      times: ['21:30'],
      color: '#8b5cf6',
      notes: 'Перед сном',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],
  pillLogs: [],
  waterLogs: [
    {
      id: 'w-1',
      date: getTodayString(),
      amount: 250,
      timestamp: new Date().toISOString(),
    },
  ],
  waterSettings: {
    dailyGoal: 2000,
    reminderIntervalHours: 2,
    reminderStartTime: '08:30',
    reminderEndTime: '22:00',
    enabledReminders: true,
  },
  notificationSettings: {
    enabled: true,
    pillReminders: true,
    waterReminders: true,
    cycleReminders: true,
  },
};

export function App() {
  const [appData, setAppData] = useState<AppData>(defaultData);
  const [activeTab, setActiveTab] = useState<TabType>('cycle');
  const [isPillModalOpen, setIsPillModalOpen] = useState(false);
  const [newPillName, setNewPillName] = useState('');
  const [newPillDosage, setNewPillDosage] = useState('1 табл.');
  const [newPillTime, setNewPillTime] = useState('09:00');

  // Load from Storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(res => {
      if (res) {
        try {
          setAppData(JSON.parse(res));
        } catch {}
      }
    });
  }, []);

  // Save to Storage
  const saveData = (newData: AppData) => {
    setAppData(newData);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  // Sync to Widget and Notifications
  useWidgetSync(appData);
  const { testTrigger } = useNotifications(appData);

  const todayStr = getTodayString();
  const prediction = getCyclePrediction(appData.periods, appData.cycleSettings, todayStr);
  const latestPeriod = [...appData.periods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

  // Water Total
  const todayWaterLogs = appData.waterLogs.filter(w => w.date === todayStr);
  const waterTotal = todayWaterLogs.reduce((acc, w) => acc + w.amount, 0);

  // Handlers
  const handleTogglePeriodToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isOngoing = latestPeriod && !latestPeriod.endDate;
    if (isOngoing) {
      const updated = appData.periods.map(p =>
        p.id === latestPeriod.id ? { ...p, endDate: todayStr } : p
      );
      saveData({ ...appData, periods: updated });
    } else {
      const newP: CyclePeriod = { id: 'p-' + Date.now(), startDate: todayStr };
      saveData({ ...appData, periods: [newP, ...appData.periods] });
    }
  };

  const handleAddWater = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLog = {
      id: 'w-' + Date.now(),
      date: todayStr,
      amount,
      timestamp: new Date().toISOString(),
    };
    saveData({ ...appData, waterLogs: [newLog, ...appData.waterLogs] });
  };

  const handleTogglePill = (pillId: string, time: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isAlreadyTaken = appData.pillLogs.some(
      l => l.pillId === pillId && l.date === todayStr && l.scheduledTime === time && l.status === 'taken'
    );

    const filtered = appData.pillLogs.filter(
      l => !(l.pillId === pillId && l.date === todayStr && l.scheduledTime === time)
    );

    if (!isAlreadyTaken) {
      filtered.push({
        id: 'pl-' + Date.now(),
        pillId,
        date: todayStr,
        scheduledTime: time,
        status: 'taken',
        takenAt: new Date().toISOString(),
      });
    }

    saveData({ ...appData, pillLogs: filtered });
  };

  const handleCreatePill = () => {
    if (!newPillName.trim()) return;
    const newPill: Pill = {
      id: 'pill-' + Date.now(),
      name: newPillName.trim(),
      dosage: newPillDosage.trim() || '1 табл.',
      category: 'vitamin',
      times: [newPillTime.trim() || '09:00'],
      color: '#8b5cf6',
      active: true,
      createdAt: new Date().toISOString(),
    };
    saveData({ ...appData, pills: [...appData.pills, newPill] });
    setNewPillName('');
    setIsPillModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>LUNA • АВТОНОМНЫЙ ТРЕКЕР</Text>
          <Text style={styles.headerTitle}>
            {activeTab === 'cycle' && 'Мой Цикл'}
            {activeTab === 'pills' && 'Таблетки'}
            {activeTab === 'water' && 'Водный Баланс'}
            {activeTab === 'settings' && 'Настройки & Виджет'}
          </Text>
        </View>
        <View style={styles.avatarBadge}>
          <Text style={{ fontSize: 20 }}>🌸</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CYCLE TAB */}
        {activeTab === 'cycle' && (
          <View style={styles.tabContent}>
            {/* Status Hero Card */}
            <View style={styles.card}>
              <View style={styles.ringContainer}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringTag}>ЦИКЛ</Text>
                  <Text style={styles.ringDay}>{prediction.currentDayOfCycle}</Text>
                  <Text style={styles.ringSub}>день</Text>
                </View>
              </View>

              <Text style={styles.phaseTitle}>{prediction.phaseName}</Text>
              <Text style={styles.phaseDescription}>{prediction.phaseDescription}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.badge, prediction.pregnancyChance === 'high' ? styles.badgeGreen : styles.badgePink]}>
                  <Text style={styles.badgeText}>
                    {prediction.pregnancyChance === 'high' ? '✨ Высокая фертильность' : 'Низкая вероятность зачатия'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleTogglePeriodToday}>
                <Text style={styles.primaryButtonText}>
                  {latestPeriod && !latestPeriod.endDate ? '✓ Завершить месячные' : '+ Начались месячные'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.row}>
              <View style={[styles.statBox, { backgroundColor: '#fff1f2' }]}>
                <Text style={styles.statNumber}>{appData.cycleSettings.averageCycleLength} дн.</Text>
                <Text style={styles.statLabel}>Средний цикл</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#fdf2f8' }]}>
                <Text style={styles.statNumber}>{prediction.daysUntilNextPeriod} дн.</Text>
                <Text style={styles.statLabel}>До след. цикла</Text>
              </View>
            </View>
          </View>
        )}

        {/* PILLS TAB */}
        {activeTab === 'pills' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardMiniTitle}>СЕГОДНЯ</Text>
                  <Text style={styles.cardMainTitle}>Прием таблеток</Text>
                </View>
                <TouchableOpacity
                  style={styles.smallAddBtn}
                  onPress={() => setIsPillModalOpen(true)}
                >
                  <Text style={styles.smallAddBtnText}>+ Добавить</Text>
                </TouchableOpacity>
              </View>
            </View>

            {appData.pills.map(pill => (
              <View key={pill.id} style={styles.pillCard}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.pillName}>{pill.name}</Text>
                    <Text style={styles.pillDosage}>{pill.dosage} • {pill.notes || 'По расписанию'}</Text>
                  </View>
                  <Text style={{ fontSize: 24 }}>💊</Text>
                </View>

                <View style={styles.timeRow}>
                  {pill.times.map(time => {
                    const isTaken = appData.pillLogs.some(
                      l => l.pillId === pill.id && l.date === todayStr && l.scheduledTime === time && l.status === 'taken'
                    );
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.pillTimeBtn, isTaken && styles.pillTimeBtnActive]}
                        onPress={() => handleTogglePill(pill.id, time)}
                      >
                        <Text style={[styles.pillTimeText, isTaken && styles.pillTimeTextActive]}>
                          {isTaken ? `✓ ${time} Выпито` : `○ ${time} Выпить`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* WATER TAB */}
        {activeTab === 'water' && (
          <View style={styles.tabContent}>
            <View style={[styles.card, { alignItems: 'center' }]}>
              <View style={styles.waterCircle}>
                <Text style={styles.waterMl}>{waterTotal}</Text>
                <Text style={styles.waterGoal}>/ {appData.waterSettings.dailyGoal} мл</Text>
                <Text style={styles.waterPercent}>
                  {Math.round((waterTotal / appData.waterSettings.dailyGoal) * 100)}% нормы
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>БЫСТРОЕ ДОБАВЛЕНИЕ</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.quickWaterBtn} onPress={() => handleAddWater(150)}>
                <Text style={{ fontSize: 24 }}>☕</Text>
                <Text style={styles.quickWaterText}>+150 мл</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickWaterBtn} onPress={() => handleAddWater(250)}>
                <Text style={{ fontSize: 24 }}>🥛</Text>
                <Text style={styles.quickWaterText}>+250 мл</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickWaterBtn} onPress={() => handleAddWater(500)}>
                <Text style={{ fontSize: 24 }}>🚰</Text>
                <Text style={styles.quickWaterText}>+500 мл</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SETTINGS & WIDGET TAB */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            {/* Widget status banner */}
            <View style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#166534' }}>
                🟢 Нативный виджет iOS активен
              </Text>
              <Text style={{ fontSize: 11, color: '#15803d', marginTop: 4 }}>
                Данные автоматически синхронизируются с виджетом на рабочем столе через App Group (group.com.luna.tracker).
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardMainTitle}>Уведомления</Text>
              <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={testTrigger}>
                <Text style={styles.primaryButtonText}>🔔 Проверить тестовое уведомление</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Pill Modal */}
      <Modal visible={isPillModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новое напоминание</Text>

            <Text style={styles.inputLabel}>Название</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Например: Омега-3, Джес..."
              value={newPillName}
              onChangeText={setNewPillName}
            />

            <Text style={styles.inputLabel}>Дозировка</Text>
            <TextInput
              style={styles.textInput}
              placeholder="1 табл."
              value={newPillDosage}
              onChangeText={setNewPillDosage}
            />

            <Text style={styles.inputLabel}>Время приема</Text>
            <TextInput
              style={styles.textInput}
              placeholder="09:00"
              value={newPillTime}
              onChangeText={setNewPillTime}
            />

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]}
                onPress={() => setIsPillModalOpen(false)}
              >
                <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#8b5cf6' }]}
                onPress={handleCreatePill}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('cycle')}>
          <Text style={[styles.tabIcon, activeTab === 'cycle' && styles.tabActive]}>🌸</Text>
          <Text style={[styles.tabLabel, activeTab === 'cycle' && styles.tabLabelActive]}>Цикл</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('pills')}>
          <Text style={[styles.tabIcon, activeTab === 'pills' && styles.tabActive]}>💊</Text>
          <Text style={[styles.tabLabel, activeTab === 'pills' && styles.tabLabelActive]}>Таблетки</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('water')}>
          <Text style={[styles.tabIcon, activeTab === 'water' && styles.tabActive]}>💧</Text>
          <Text style={[styles.tabLabel, activeTab === 'water' && styles.tabLabelActive]}>Вода</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Опции</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff1f2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 63, 94, 0.1)',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f43f5e',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContent: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  ringContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: '#f43f5e',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  ringInner: {
    alignItems: 'center',
  },
  ringTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f43f5e',
  },
  ringDay: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1e293b',
  },
  ringSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 8,
  },
  phaseDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  badgeRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgePink: {
    backgroundColor: '#ffe4e6',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  primaryButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#e11d48',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  cardMiniTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8b5cf6',
  },
  cardMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  smallAddBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  smallAddBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  pillCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  pillName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  pillDosage: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pillTimeBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  pillTimeBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  pillTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  pillTimeTextActive: {
    color: '#15803d',
  },
  waterCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#e0f2fe',
    borderWidth: 6,
    borderColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterMl: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0369a1',
  },
  waterGoal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  waterPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369a1',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  quickWaterBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  quickWaterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
    marginTop: 4,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingBottom: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 63, 94, 0.1)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#f43f5e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    marginTop: 12,
  },
});
