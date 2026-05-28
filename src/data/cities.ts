import type { City, Place } from '../types';

export const interests = [
  { id: 'food', title: 'Еда', icon: '🍽️' },
  { id: 'history', title: 'История', icon: '🏛️' },
  { id: 'photo', title: 'Фото', icon: '📸' },
  { id: 'shopping', title: 'Шопинг', icon: '🛍️' },
  { id: 'family', title: 'Семья', icon: '👨‍👩‍👧' },
  { id: 'romance', title: 'Романтика', icon: '✨' },
  { id: 'nature', title: 'Природа', icon: '🌿' },
  { id: 'night', title: 'Вечер', icon: '🌙' }
];

export const cities: City[] = [
  {
    id: 'tashkent',
    title: 'Ташкент',
    country: 'Узбекистан',
    short: 'Современный город, базары, парки, кафе и восточная архитектура.',
    hero: 'Город для первого знакомства с Узбекистаном без хаоса.',
    accent: '#2563EB',
    dailyBudgetUZS: { economy: 280000, comfort: 650000, premium: 1450000 },
    phrases: [
      { ru: 'Сколько стоит?', local: 'Bu qancha turadi?', meaning: 'Спросить цену' },
      { ru: 'Отвезите меня сюда', local: 'Meni shu yerga olib boring', meaning: 'Для такси' },
      { ru: 'Спасибо', local: 'Rahmat', meaning: 'Вежливо поблагодарить' }
    ]
  },
  {
    id: 'samarkand',
    title: 'Самарканд',
    country: 'Узбекистан',
    short: 'Регистан, Шахи-Зинда, плов, сувениры и сильная историческая атмосфера.',
    hero: 'Идеальный город для туриста, который хочет вау‑маршрут за 1 день.',
    accent: '#7C3AED',
    dailyBudgetUZS: { economy: 320000, comfort: 760000, premium: 1600000 },
    phrases: [
      { ru: 'Где находится Регистан?', local: 'Registon qayerda?', meaning: 'Спросить дорогу' },
      { ru: 'Можно сфотографировать?', local: 'Rasmga olsa bo‘ladimi?', meaning: 'Фото/видео' },
      { ru: 'Очень красиво', local: 'Juda chiroyli', meaning: 'Комплимент месту' }
    ]
  },
  {
    id: 'bukhara',
    title: 'Бухара',
    country: 'Узбекистан',
    short: 'Старый город, минареты, ремесленники, чайханы и атмосферные прогулки.',
    hero: 'Медленный красивый маршрут для прогулок, фото и восточного вайба.',
    accent: '#D97706',
    dailyBudgetUZS: { economy: 300000, comfort: 700000, premium: 1500000 },
    phrases: [
      { ru: 'Где старый город?', local: 'Eski shahar qayerda?', meaning: 'Спросить направление' },
      { ru: 'Можно дешевле?', local: 'Arzonroq qilasizmi?', meaning: 'Торг на рынке' },
      { ru: 'Мне нужен чай', local: 'Menga choy kerak', meaning: 'В кафе' }
    ]
  },
  {
    id: 'khiva',
    title: 'Хива',
    country: 'Узбекистан',
    short: 'Город-музей под открытым небом, крепостные стены, минареты и закаты.',
    hero: 'Маршрут для тех, кто хочет почувствовать древний Восток.',
    accent: '#059669',
    dailyBudgetUZS: { economy: 260000, comfort: 620000, premium: 1300000 },
    phrases: [
      { ru: 'Где вход в Ичан-Калу?', local: 'Ichan Qalʼaga kirish qayerda?', meaning: 'Вход в старый город' },
      { ru: 'Сколько стоит билет?', local: 'Chipta qancha turadi?', meaning: 'Цена билета' },
      { ru: 'Где можно поесть?', local: 'Qayerda ovqatlansa bo‘ladi?', meaning: 'Еда рядом' }
    ]
  }
];

export const places: Place[] = [
  {
    id: 'tashkent-1', cityId: 'tashkent', title: 'Комплекс Хазрати Имам', subtitle: 'Главная историческая точка города', category: 'История', durationMinutes: 70, priceUZS: 30000, bestTime: '10:00–12:00', address: 'Старый город', tip: 'Лучше приезжать утром: мягкий свет и меньше людей.', safety: 'Спокойная зона, держите телефон ближе к себе на людных местах.', tags: ['history', 'photo', 'family']
  },
  {
    id: 'tashkent-2', cityId: 'tashkent', title: 'Чорсу базар', subtitle: 'Еда, специи, сувениры и живой город', category: 'Еда', durationMinutes: 85, priceUZS: 90000, bestTime: '11:00–14:00', address: 'м. Чорсу', tip: 'Не покупайте сразу: сначала сравните цены в 2–3 рядах.', safety: 'Людно, аккуратнее с кошельком.', tags: ['food', 'shopping', 'photo']
  },
  {
    id: 'tashkent-3', cityId: 'tashkent', title: 'Magic City / парк', subtitle: 'Вечерняя прогулка, кафе, фото', category: 'Вечер', durationMinutes: 90, priceUZS: 120000, bestTime: '18:30–21:00', address: 'район Алмазар', tip: 'Хорошо подходит для семьи и легкой прогулки вечером.', safety: 'Комфортно вечером, но обратно лучше ехать на такси.', tags: ['family', 'night', 'photo']
  },
  {
    id: 'tashkent-4', cityId: 'tashkent', title: 'Broadway и площадь Амира Темура', subtitle: 'Центр, прогулка, кофе и атмосфера', category: 'Прогулка', durationMinutes: 75, priceUZS: 70000, bestTime: '17:00–20:00', address: 'Центр города', tip: 'Сделайте вечернюю прогулку после музея или кафе.', safety: 'Безопасно, но не соглашайтесь на навязчивые предложения.', tags: ['romance', 'night', 'photo']
  },
  {
    id: 'samarkand-1', cityId: 'samarkand', title: 'Регистан', subtitle: 'Главный символ Самарканда', category: 'История', durationMinutes: 110, priceUZS: 70000, bestTime: '09:00–11:30', address: 'Registon ko‘chasi', tip: 'Вернитесь вечером ради подсветки — это отдельный вау‑эффект.', safety: 'Туристическая зона, цены у продавцов могут быть завышены.', tags: ['history', 'photo', 'romance']
  },
  {
    id: 'samarkand-2', cityId: 'samarkand', title: 'Сиабский базар', subtitle: 'Лепешки, сладости, специи и сувениры', category: 'Шопинг', durationMinutes: 80, priceUZS: 110000, bestTime: '12:00–14:00', address: 'рядом с Биби-Ханым', tip: 'Покупайте самаркандские лепешки и пробуйте до покупки.', safety: 'Торгуйтесь спокойно и заранее уточняйте цену.', tags: ['food', 'shopping', 'family']
  },
  {
    id: 'samarkand-3', cityId: 'samarkand', title: 'Шахи-Зинда', subtitle: 'Одна из самых красивых улиц мавзолеев', category: 'Фото', durationMinutes: 85, priceUZS: 60000, bestTime: '15:30–17:30', address: 'улица Шахи-Зинда', tip: 'Лучший свет ближе к вечеру, одежда лучше спокойная и уважительная.', safety: 'Священное место — соблюдайте тишину и уважение.', tags: ['history', 'photo', 'romance']
  },
  {
    id: 'samarkand-4', cityId: 'samarkand', title: 'Самаркандский плов', subtitle: 'Обед в локальном месте', category: 'Еда', durationMinutes: 70, priceUZS: 90000, bestTime: '12:30–14:30', address: 'локальные ош‑центры', tip: 'Плов лучше есть днем: к вечеру хорошие места могут закончить подачу.', safety: 'Берите место с большим потоком гостей.', tags: ['food', 'family']
  },
  {
    id: 'bukhara-1', cityId: 'bukhara', title: 'Ляби-Хауз', subtitle: 'Сердце старой Бухары', category: 'Прогулка', durationMinutes: 80, priceUZS: 50000, bestTime: '10:00–12:00', address: 'старый город', tip: 'Начните отсюда, потом идите пешком по старому городу.', safety: 'Комфортная зона, вечером много туристов.', tags: ['history', 'photo', 'food']
  },
  {
    id: 'bukhara-2', cityId: 'bukhara', title: 'Калян минарет', subtitle: 'Сильная архитектурная точка', category: 'История', durationMinutes: 70, priceUZS: 45000, bestTime: '16:00–18:00', address: 'центр старого города', tip: 'На закате получается самый дорогой визуал для фото.', safety: 'Смотрите под ноги: старые каменные покрытия.', tags: ['history', 'photo', 'romance']
  },
  {
    id: 'bukhara-3', cityId: 'bukhara', title: 'Торговые купола', subtitle: 'Сувениры, ткани, керамика и ремесла', category: 'Шопинг', durationMinutes: 90, priceUZS: 140000, bestTime: '13:00–16:00', address: 'старый город', tip: 'Сравните цены и обязательно торгуйтесь мягко.', safety: 'Проверяйте упаковку и качество товара.', tags: ['shopping', 'photo', 'family']
  },
  {
    id: 'khiva-1', cityId: 'khiva', title: 'Ичан-Кала', subtitle: 'Старый город внутри крепостных стен', category: 'История', durationMinutes: 140, priceUZS: 90000, bestTime: '09:00–12:00', address: 'центр Хивы', tip: 'Планируйте пешую прогулку, удобная обувь обязательна.', safety: 'Днем жарко — вода и головной убор обязательны.', tags: ['history', 'photo', 'family']
  },
  {
    id: 'khiva-2', cityId: 'khiva', title: 'Кальта-Минор', subtitle: 'Бирюзовый минарет для ярких фото', category: 'Фото', durationMinutes: 45, priceUZS: 30000, bestTime: '17:00–19:00', address: 'Ичан-Кала', tip: 'Идите ближе к закату — цвета становятся мягче.', safety: 'Много туристов, следите за вещами.', tags: ['photo', 'history', 'romance']
  },
  {
    id: 'khiva-3', cityId: 'khiva', title: 'Ужин на террасе', subtitle: 'Вид на старый город вечером', category: 'Еда', durationMinutes: 90, priceUZS: 150000, bestTime: '19:00–21:00', address: 'рядом с Ичан-Калой', tip: 'Бронируйте столик с видом заранее.', safety: 'Возвращайтесь в отель на официальном такси.', tags: ['food', 'night', 'romance']
  }
];
