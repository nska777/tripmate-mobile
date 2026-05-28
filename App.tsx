import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cities, interests } from './src/data/cities';
import { budgetLabel, buildRoute, durationLabel, formatUZS } from './src/lib/routeBuilder';
import type { BudgetLevel, GeneratedRoute, TripDuration } from './src/types';

type Tab = 'planner' | 'route' | 'assistant' | 'saved';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const durations: { id: TripDuration; title: string; subtitle: string }[] = [
  { id: '3h', title: '3 часа', subtitle: 'Быстрый маршрут' },
  { id: '1d', title: '1 день', subtitle: 'Главное за день' },
  { id: '2d', title: '2 дня', subtitle: 'Спокойный темп' },
  { id: '3d', title: '3 дня', subtitle: 'Глубокое знакомство' }
];

const budgets: { id: BudgetLevel; title: string; subtitle: string }[] = [
  { id: 'economy', title: 'Эконом', subtitle: 'Без лишних трат' },
  { id: 'comfort', title: 'Комфорт', subtitle: 'Оптимально' },
  { id: 'premium', title: 'Премиум', subtitle: 'Лучшие места' }
];

export default function App() {
  const [tab, setTab] = useState<Tab>('planner');
  const [cityId, setCityId] = useState(cities[0].id);
  const [duration, setDuration] = useState<TripDuration>('1d');
  const [budget, setBudget] = useState<BudgetLevel>('comfort');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['history', 'food', 'photo']);
  const [savedRoutes, setSavedRoutes] = useState<GeneratedRoute[]>([]);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'hello',
      role: 'assistant',
      text: 'Привет! Я локальный AI‑гид. Спроси: “куда сходить вечером?”, “где не переплатить?”, “что посмотреть за 3 часа?”'
    }
  ]);

  const route = useMemo(() => buildRoute(cityId, duration, budget, selectedInterests), [cityId, duration, budget, selectedInterests]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const saveCurrentRoute = () => {
    setSavedRoutes((current) => [route, ...current].slice(0, 8));
    setTab('saved');
  };

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const city = route.city.title;
    let answer = `Я бы начал с маршрута по городу ${city}: ${route.stops.map((stop) => stop.title).join(' → ')}. Бюджет примерно ${formatUZS(route.totalBudget)}.`;

    if (lower.includes('вечер') || lower.includes('ноч')) {
      const evening = route.stops.find((stop) => stop.tags.includes('night') || stop.bestTime.includes('19')) ?? route.stops[route.stops.length - 1];
      answer = `На вечер в ${city} лучше: ${evening.title}. ${evening.tip} Обратно лучше ехать на официальном такси.`;
    }

    if (lower.includes('дешев') || lower.includes('эконом') || lower.includes('не переплат')) {
      answer = `Чтобы не переплатить: заранее уточняй цену, сравни 2–3 места, не соглашайся на навязчивые предложения. Для ${city} эконом‑день можно держать около ${formatUZS(route.city.dailyBudgetUZS.economy)} без крупных покупок.`;
    }

    if (lower.includes('фото') || lower.includes('инст')) {
      const photo = route.stops.find((stop) => stop.tags.includes('photo')) ?? route.stops[0];
      answer = `Для фото выбирай ${photo.title}. Лучшее время: ${photo.bestTime}. Совет: ${photo.tip}`;
    }

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text },
      { id: `a-${Date.now()}`, role: 'assistant', text: answer }
    ]);
    setChatText('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <Header route={route} />

        {tab === 'planner' && (
          <PlannerScreen
            cityId={cityId}
            setCityId={setCityId}
            duration={duration}
            setDuration={setDuration}
            budget={budget}
            setBudget={setBudget}
            selectedInterests={selectedInterests}
            toggleInterest={toggleInterest}
            route={route}
            onBuild={() => setTab('route')}
          />
        )}

        {tab === 'route' && <RouteScreen route={route} onSave={saveCurrentRoute} />}
        {tab === 'assistant' && (
          <AssistantScreen messages={messages} chatText={chatText} setChatText={setChatText} onSend={sendChat} />
        )}
        {tab === 'saved' && <SavedScreen savedRoutes={savedRoutes} openRoute={() => setTab('route')} />}

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({ route }: { route: GeneratedRoute }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>AI‑гид по незнакомому городу</Text>
      </View>
      <View style={styles.cityPill}>
        <Ionicons name="location" size={15} color="#fff" />
        <Text style={styles.cityPillText}>{route.city.title}</Text>
      </View>
    </View>
  );
}

function PlannerScreen(props: {
  cityId: string;
  setCityId: (id: string) => void;
  duration: TripDuration;
  setDuration: (id: TripDuration) => void;
  budget: BudgetLevel;
  setBudget: (id: BudgetLevel) => void;
  selectedInterests: string[];
  toggleInterest: (id: string) => void;
  route: GeneratedRoute;
  onBuild: () => void;
}) {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPad}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>MVP для туристов</Text>
        <Text style={styles.heroTitle}>Собери маршрут за 30 секунд</Text>
        <Text style={styles.heroText}>Выбери город, время, бюджет и интересы — приложение подготовит готовый план дня.</Text>
      </View>

      <Section title="1. Куда едем?">
        <FlatList
          horizontal
          data={cities}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => props.setCityId(item.id)}
              style={[styles.cityCard, props.cityId === item.id && styles.activeCard]}
            >
              <Text style={styles.cityTitle}>{item.title}</Text>
              <Text style={styles.cityCountry}>{item.country}</Text>
              <Text style={styles.cityDesc}>{item.short}</Text>
            </Pressable>
          )}
        />
      </Section>

      <Section title="2. Сколько времени?">
        <View style={styles.gridTwo}>
          {durations.map((item) => (
            <ChoiceCard key={item.id} title={item.title} subtitle={item.subtitle} active={props.duration === item.id} onPress={() => props.setDuration(item.id)} />
          ))}
        </View>
      </Section>

      <Section title="3. Бюджет">
        <View style={styles.gridThree}>
          {budgets.map((item) => (
            <ChoiceCard key={item.id} title={item.title} subtitle={item.subtitle} active={props.budget === item.id} onPress={() => props.setBudget(item.id)} compact />
          ))}
        </View>
      </Section>

      <Section title="4. Интересы">
        <View style={styles.chipsWrap}>
          {interests.map((item) => {
            const active = props.selectedInterests.includes(item.id);
            return (
              <Pressable key={item.id} onPress={() => props.toggleInterest(item.id)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={styles.chipText}>{item.icon} {item.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Предварительный план</Text>
        <Text style={styles.summaryTitle}>{props.route.city.title} • {durationLabel(props.route.duration)} • {budgetLabel(props.route.budget)}</Text>
        <Text style={styles.summaryText}>Маршрут: {props.route.stops.map((stop) => stop.title).join(' → ')}</Text>
        <Text style={styles.summaryBudget}>≈ {formatUZS(props.route.totalBudget)}</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={props.onBuild}>
        <Text style={styles.primaryButtonText}>Построить маршрут</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

function RouteScreen({ route, onSave }: { route: GeneratedRoute; onSave: () => void }) {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentPad}>
      <View style={styles.routeTopCard}>
        <Text style={styles.heroKicker}>Готовый маршрут</Text>
        <Text style={styles.routeTitle}>{route.city.title} за {durationLabel(route.duration)}</Text>
        <Text style={styles.heroText}>{route.city.hero}</Text>
        <View style={styles.metricsRow}>
          <Metric label="Бюджет" value={formatUZS(route.totalBudget)} />
          <Metric label="Точек" value={`${route.stops.length}`} />
          <Metric label="Формат" value={budgetLabel(route.budget)} />
        </View>
      </View>

      <Section title="План по времени">
        {route.stops.map((stop, index) => (
          <View key={stop.id} style={styles.stopCard}>
            <View style={styles.timelineRail}>
              <View style={styles.timelineDot}><Text style={styles.timelineNumber}>{index + 1}</Text></View>
              {index !== route.stops.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.stopBody}>
              <View style={styles.stopHeader}>
                <Text style={styles.stopTime}>{stop.time}</Text>
                <Text style={styles.stopCategory}>{stop.category}</Text>
              </View>
              <Text style={styles.stopTitle}>{stop.title}</Text>
              <Text style={styles.stopSubtitle}>{stop.subtitle}</Text>
              <Text style={styles.stopInfo}>📍 {stop.address}</Text>
              <Text style={styles.stopInfo}>🚕 {stop.transfer}</Text>
              <Text style={styles.stopTip}>Совет: {stop.tip}</Text>
              <Text style={styles.stopSafety}>Безопасность: {stop.safety}</Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title="Фразы для города">
        {route.city.phrases.map((phrase) => (
          <View key={phrase.local} style={styles.phraseCard}>
            <Text style={styles.phraseRu}>{phrase.ru}</Text>
            <Text style={styles.phraseLocal}>{phrase.local}</Text>
            <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
          </View>
        ))}
      </Section>

      <Pressable style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>Сохранить маршрут</Text>
        <Ionicons name="bookmark" size={19} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

function AssistantScreen(props: {
  messages: ChatMessage[];
  chatText: string;
  setChatText: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <KeyboardAvoidingView style={styles.assistantWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.chatList} contentContainerStyle={styles.chatPad} showsVerticalScrollIndicator={false}>
        {props.messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.bubbleText, message.role === 'user' && styles.userBubbleText]}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.chatInputRow}>
        <TextInput
          value={props.chatText}
          onChangeText={props.setChatText}
          placeholder="Спроси AI‑гида..."
          placeholderTextColor="#94A3B8"
          style={styles.chatInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={props.onSend}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SavedScreen({ savedRoutes, openRoute }: { savedRoutes: GeneratedRoute[]; openRoute: () => void }) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
      <Section title="Сохраненные маршруты">
        {savedRoutes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Пока нет сохраненных маршрутов</Text>
            <Text style={styles.emptyText}>Собери маршрут и нажми “Сохранить маршрут”.</Text>
          </View>
        ) : (
          savedRoutes.map((route, index) => (
            <Pressable key={`${route.city.id}-${index}`} style={styles.savedCard} onPress={openRoute}>
              <Text style={styles.savedTitle}>{route.city.title} • {durationLabel(route.duration)}</Text>
              <Text style={styles.savedText}>{route.stops.map((stop) => stop.title).join(' → ')}</Text>
              <Text style={styles.savedBudget}>{formatUZS(route.totalBudget)}</Text>
            </Pressable>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

function BottomTabs({ active, setActive }: { active: Tab; setActive: (tab: Tab) => void }) {
  const tabs: { id: Tab; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'planner', title: 'План', icon: 'options' },
    { id: 'route', title: 'Маршрут', icon: 'map' },
    { id: 'assistant', title: 'AI', icon: 'chatbubble-ellipses' },
    { id: 'saved', title: 'Сохранено', icon: 'bookmark' }
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Pressable key={tab.id} onPress={() => setActive(tab.id)} style={[styles.tabItem, isActive && styles.tabItemActive]}>
            <Ionicons name={tab.icon} size={19} color={isActive ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ChoiceCard(props: { title: string; subtitle: string; active: boolean; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.choiceCard, props.compact && styles.choiceCompact, props.active && styles.activeCard]}>
      <Text style={styles.choiceTitle}>{props.title}</Text>
      <Text style={styles.choiceSubtitle}>{props.subtitle}</Text>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  app: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  headerSub: { color: '#CBD5E1', marginTop: 2, fontSize: 12 },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  cityPillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  content: { flex: 1 },
  contentPad: { padding: 16, paddingBottom: 110 },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6
  },
  heroKicker: { color: '#38BDF8', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 8, letterSpacing: -1 },
  heroText: { color: '#CBD5E1', fontSize: 14, lineHeight: 21, marginTop: 10 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 12, letterSpacing: -0.2 },
  horizontalList: { gap: 12, paddingRight: 12 },
  cityCard: {
    width: 210,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activeCard: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  cityTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  cityCountry: { color: '#2563EB', fontWeight: '800', marginTop: 3 },
  cityDesc: { color: '#64748B', fontSize: 13, lineHeight: 18, marginTop: 8 },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridThree: { flexDirection: 'row', gap: 8 },
  choiceCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  choiceCompact: { flex: 1, paddingHorizontal: 10 },
  choiceTitle: { fontSize: 15, color: '#0F172A', fontWeight: '900' },
  choiceSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { backgroundColor: '#fff', borderColor: '#E2E8F0', borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999 },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  chipText: { fontWeight: '800', color: '#0F172A' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  summaryLabel: { color: '#2563EB', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  summaryTitle: { color: '#0F172A', fontWeight: '900', fontSize: 18, marginTop: 6 },
  summaryText: { color: '#64748B', marginTop: 8, lineHeight: 20 },
  summaryBudget: { color: '#16A34A', fontSize: 22, fontWeight: '900', marginTop: 10 },
  primaryButton: {
    minHeight: 56,
    backgroundColor: '#2563EB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  routeTopCard: { backgroundColor: '#0F172A', borderRadius: 28, padding: 20, marginBottom: 20 },
  routeTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 8, letterSpacing: -0.8 },
  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  metric: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 10 },
  metricLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800' },
  metricValue: { color: '#fff', fontSize: 13, fontWeight: '900', marginTop: 4 },
  stopCard: { flexDirection: 'row', marginBottom: 14 },
  timelineRail: { width: 34, alignItems: 'center' },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  timelineNumber: { color: '#fff', fontWeight: '900', fontSize: 12 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#BFDBFE', marginTop: 4 },
  stopBody: { flex: 1, backgroundColor: '#fff', borderRadius: 22, padding: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stopTime: { color: '#2563EB', fontWeight: '900' },
  stopCategory: { color: '#64748B', fontWeight: '800', fontSize: 12 },
  stopTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  stopSubtitle: { color: '#64748B', marginTop: 3, lineHeight: 19 },
  stopInfo: { color: '#334155', marginTop: 8, fontWeight: '700' },
  stopTip: { color: '#0F172A', marginTop: 10, lineHeight: 19 },
  stopSafety: { color: '#B45309', marginTop: 8, lineHeight: 19, fontWeight: '700' },
  phraseCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 14, marginBottom: 10 },
  phraseRu: { fontWeight: '900', color: '#0F172A', fontSize: 15 },
  phraseLocal: { color: '#2563EB', fontWeight: '900', fontSize: 17, marginTop: 4 },
  phraseMeaning: { color: '#64748B', marginTop: 4 },
  assistantWrap: { flex: 1, paddingBottom: 82 },
  chatList: { flex: 1 },
  chatPad: { padding: 16, paddingBottom: 20 },
  bubble: { maxWidth: '84%', padding: 14, borderRadius: 20, marginBottom: 10 },
  assistantBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E2E8F0' },
  userBubble: { backgroundColor: '#2563EB', alignSelf: 'flex-end' },
  bubbleText: { color: '#0F172A', lineHeight: 20, fontWeight: '600' },
  userBubbleText: { color: '#fff' },
  chatInputRow: { flexDirection: 'row', gap: 10, padding: 14, backgroundColor: '#F8FAFC', borderTopWidth: 1, borderColor: '#E2E8F0' },
  chatInput: { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A', fontWeight: '700' },
  sendButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  emptyText: { color: '#64748B', marginTop: 6 },
  savedCard: { backgroundColor: '#fff', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  savedTitle: { fontSize: 17, color: '#0F172A', fontWeight: '900' },
  savedText: { color: '#64748B', marginTop: 8, lineHeight: 20 },
  savedBudget: { color: '#16A34A', fontWeight: '900', fontSize: 18, marginTop: 10 },
  tabs: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 8,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 18, gap: 2 },
  tabItemActive: { backgroundColor: '#0F172A' },
  tabText: { fontSize: 10, fontWeight: '900', color: '#64748B' },
  tabTextActive: { color: '#fff' }
});
