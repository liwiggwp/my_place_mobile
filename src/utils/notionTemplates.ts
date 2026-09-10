import type { NotionPage, NotionDatabase, WorkspaceTemplate } from '../types/notion';
import { getTodayString, addDays } from './dateUtils';

export const DEFAULT_DATABASES: NotionDatabase[] = [
  {
    id: 'db-books',
    name: 'Книжная полка',
    icon: '📚',
    description: 'Трекер прочитанных книг и списка к прочтению',
    properties: [
      {
        id: 'prop-status',
        name: 'Статус',
        type: 'select',
        options: [
          { id: 'opt-reading', label: 'Читаю сейчас', color: 'bg-blue-100 text-blue-800' },
          { id: 'opt-plan', label: 'В планах', color: 'bg-amber-100 text-amber-800' },
          { id: 'opt-done', label: 'Прочитано', color: 'bg-emerald-100 text-emerald-800' }
        ]
      },
      {
        id: 'prop-author',
        name: 'Автор',
        type: 'text'
      },
      {
        id: 'prop-rating',
        name: 'Оценка',
        type: 'rating'
      },
      {
        id: 'prop-date',
        name: 'Дата прочтения',
        type: 'date'
      }
    ],
    items: [
      {
        id: 'item-b1',
        title: 'Атомные привычки',
        properties: {
          'prop-status': 'opt-done',
          'prop-author': 'Джеймс Клир',
          'prop-rating': 5,
          'prop-date': getTodayString()
        },
        blocks: [
          {
            id: 'b-b1-1',
            type: 'callout',
            icon: '💡',
            color: 'amber',
            content: 'Каждое маленькое действие на 1% лучше ежедневно дает огромный результат за год.',
            createdAt: new Date().toISOString()
          },
          {
            id: 'b-b1-2',
            type: 'heading2',
            content: 'Главные выводы',
            createdAt: new Date().toISOString()
          },
          {
            id: 'b-b1-3',
            type: 'bullet',
            content: 'Сделать привычку очевидной',
            createdAt: new Date().toISOString()
          },
          {
            id: 'b-b1-4',
            type: 'bullet',
            content: 'Сделать привычку привлекательной',
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'item-b2',
        title: 'Думай медленно... решай быстро',
        properties: {
          'prop-status': 'opt-reading',
          'prop-author': 'Даниэль Канеман',
          'prop-rating': 4,
          'prop-date': addDays(getTodayString(), 14)
        },
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'item-b3',
        title: 'Эссенциализм',
        properties: {
          'prop-status': 'opt-plan',
          'prop-author': 'Грег МакКеон',
          'prop-rating': 0,
          'prop-date': addDays(getTodayString(), 30)
        },
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    defaultView: 'board',
    groupByPropertyId: 'prop-status',
    datePropertyId: 'prop-date'
  }
];

export const DEFAULT_WORKSPACE_PAGES: NotionPage[] = [
  // Builtin Hubs (All our rich full modules!)
  {
    id: 'page-hub-finance',
    title: 'Финансы и Бюджет',
    icon: '💳',
    type: 'builtin_hub',
    builtinHubType: 'finance',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-hub-tasks',
    title: 'Задачи и Планы',
    icon: '✅',
    type: 'builtin_hub',
    builtinHubType: 'tasks',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-hub-desktops',
    title: 'Рабочие Столы',
    icon: '🖥️',
    type: 'builtin_hub',
    builtinHubType: 'desktops',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-hub-water',
    title: 'Водный Баланс',
    icon: '💧',
    type: 'builtin_hub',
    builtinHubType: 'water',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-hub-pills',
    title: 'Лекарства и Витамины',
    icon: '💊',
    type: 'builtin_hub',
    builtinHubType: 'pills',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-hub-cycle',
    title: 'Мой Цикл',
    icon: '🌸',
    type: 'builtin_hub',
    builtinHubType: 'cycle',
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Custom Sample Pages & Databases
  {
    id: 'page-custom-books',
    title: 'Книжная полка',
    icon: '📚',
    type: 'custom_database',
    databaseId: 'db-books',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'page-custom-ideas',
    title: 'Банк идей и заметок',
    icon: '💡',
    type: 'custom_page',
    isPinned: false,
    blocks: [
      {
        id: 'b-id-1',
        type: 'callout',
        icon: '✨',
        color: 'indigo',
        content: 'Пространство для спонтанных мыслей, вдохновения и быстрых набросков.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'b-id-2',
        type: 'heading2',
        content: 'Идеи для проектов',
        createdAt: new Date().toISOString()
      },
      {
        id: 'b-id-3',
        type: 'todo',
        content: 'Запустить личный блог о продуктивности',
        checked: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'b-id-4',
        type: 'todo',
        content: 'Собрать коллекцию любимых рецептов для быстрых ужинов',
        checked: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'b-id-5',
        type: 'divider',
        content: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 'b-id-6',
        type: 'heading2',
        content: 'Цитата недели',
        createdAt: new Date().toISOString()
      },
      {
        id: 'b-id-7',
        type: 'quote',
        content: '«Простота — необходимое условие прекрасного.» — Лев Толстой',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const WORKSPACE_TEMPLATES_GALLERY: WorkspaceTemplate[] = [
  // Builtin Hubs
  {
    id: 'tmpl-hub-finance',
    title: 'Финансы и Бюджет',
    icon: '💳',
    category: 'finance',
    description: 'Учет счетов, карт, заначек, кредитов, истории операций и аналитика бюджета.',
    badge: 'Хаб',
    pageType: 'builtin_hub',
    builtinHubType: 'finance'
  },
  {
    id: 'tmpl-hub-tasks',
    title: 'Задачи и Планировщик',
    icon: '✅',
    category: 'productivity',
    description: 'Дневной, недельный и месячный планер с категориями, приоритетами и подзадачами.',
    badge: 'Хаб',
    pageType: 'builtin_hub',
    builtinHubType: 'tasks'
  },
  {
    id: 'tmpl-hub-desktops',
    title: 'Рабочие Столы и Виджеты',
    icon: '🖥️',
    category: 'productivity',
    description: 'Настраиваемые экраны виджетов iOS 18 с часами, фоновым режимом Standby и постерами.',
    badge: 'Хаб',
    pageType: 'builtin_hub',
    builtinHubType: 'desktops'
  },
  {
    id: 'tmpl-hub-pills',
    title: 'Лекарства и Витамины',
    icon: '💊',
    category: 'health',
    description: 'Курсы препаратов, время приема, отметки о выпитых дозах и календарь приема.',
    badge: 'Хаб',
    pageType: 'builtin_hub',
    builtinHubType: 'pills'
  },
  {
    id: 'tmpl-hub-water',
    title: 'Водный Баланс',
    icon: '💧',
    category: 'health',
    description: 'Интерактивная волна гидратации, дневная норма и быстрый лог напитков.',
    badge: 'Хаб',
    pageType: 'builtin_hub',
    builtinHubType: 'water'
  },
  {
    id: 'tmpl-hub-cycle',
    title: 'Женское Здоровье / Цикл',
    icon: '🌸',
    category: 'health',
    description: 'Календарь менструаций, фазы цикла, симптомы и прогнозы самочувствия.',
    badge: 'Хаб',
    pageType: 'builtin_hub',
    builtinHubType: 'cycle'
  },

  // Custom Notion Templates
  {
    id: 'tmpl-books',
    title: 'Книжная полка и Фильмы',
    icon: '📚',
    category: 'lifestyle',
    description: 'База данных с канбан-доской: статус («Читаю», «В планах», «Прочитано»), рейтинг ⭐️ и даты.',
    pageType: 'custom_database',
    initialDatabase: {
      properties: [
        {
          id: 'prop-status',
          name: 'Статус',
          type: 'select',
          options: [
            { id: 'opt-reading', label: 'В процессе', color: 'bg-blue-100 text-blue-800' },
            { id: 'opt-plan', label: 'В планах', color: 'bg-amber-100 text-amber-800' },
            { id: 'opt-done', label: 'Готово', color: 'bg-emerald-100 text-emerald-800' }
          ]
        },
        { id: 'prop-author', name: 'Автор / Режиссер', type: 'text' },
        { id: 'prop-rating', name: 'Оценка', type: 'rating' },
        { id: 'prop-date', name: 'Дата', type: 'date' }
      ],
      items: [
        {
          title: 'Пример книги или фильма',
          properties: {
            'prop-status': 'opt-reading',
            'prop-author': 'Имя автора',
            'prop-rating': 5,
            'prop-date': getTodayString()
          }
        }
      ],
      defaultView: 'board',
      groupByPropertyId: 'prop-status',
      datePropertyId: 'prop-date'
    }
  },
  {
    id: 'tmpl-goals',
    title: 'Цели на год',
    icon: '🎯',
    category: 'productivity',
    description: 'База целей с разбивкой по сферам жизни (Карьера, Здоровье, Финансы), дедлайнами и статусом.',
    pageType: 'custom_database',
    initialDatabase: {
      properties: [
        {
          id: 'prop-status',
          name: 'Статус',
          type: 'select',
          options: [
            { id: 'opt-active', label: 'В фокусе 🚀', color: 'bg-indigo-100 text-indigo-800' },
            { id: 'opt-plan', label: 'Запланировано ⏳', color: 'bg-amber-100 text-amber-800' },
            { id: 'opt-done', label: 'Достигнуто 🎉', color: 'bg-emerald-100 text-emerald-800' }
          ]
        },
        {
          id: 'prop-sphere',
          name: 'Сфера',
          type: 'select',
          options: [
            { id: 'opt-health', label: 'Здоровье 🌿', color: 'bg-emerald-100 text-emerald-800' },
            { id: 'opt-finance', label: 'Финансы 💰', color: 'bg-amber-100 text-amber-800' },
            { id: 'opt-career', label: 'Карьера 💼', color: 'bg-blue-100 text-blue-800' },
            { id: 'opt-travel', label: 'Путешествия ✈️', color: 'bg-purple-100 text-purple-800' }
          ]
        },
        { id: 'prop-deadline', name: 'Срок', type: 'date' },
        { id: 'prop-rating', name: 'Приоритет', type: 'rating' }
      ],
      items: [
        {
          title: 'Сформировать подушку безопасности на 3 месяца',
          properties: {
            'prop-status': 'opt-active',
            'prop-sphere': 'opt-finance',
            'prop-deadline': addDays(getTodayString(), 90),
            'prop-rating': 5
          }
        },
        {
          title: 'Регулярные пробежки 3 раза в неделю',
          properties: {
            'prop-status': 'opt-active',
            'prop-sphere': 'opt-health',
            'prop-deadline': addDays(getTodayString(), 180),
            'prop-rating': 4
          }
        }
      ],
      defaultView: 'calendar',
      groupByPropertyId: 'prop-status',
      datePropertyId: 'prop-deadline'
    }
  },
  {
    id: 'tmpl-travel',
    title: 'План путешествия',
    icon: '✈️',
    category: 'lifestyle',
    description: 'Блочная страница: подготовка к поездке, чек-листы сборов, билеты, локации и бюджет.',
    pageType: 'custom_page',
    initialBlocks: [
      {
        type: 'callout',
        icon: '🌴',
        color: 'emerald',
        content: 'План поездки: даты, билеты, список вещей и ключевые места для посещения.'
      },
      {
        type: 'heading2',
        content: 'Чек-лист перед вылетом'
      },
      {
        type: 'todo',
        content: 'Проверить паспорт и страховку',
        checked: false
      },
      {
        type: 'todo',
        content: 'Купить билеты на поезд / самолет',
        checked: true
      },
      {
        type: 'todo',
        content: 'Забронировать отель / жилье',
        checked: true
      },
      {
        type: 'todo',
        content: 'Собрать дорожную аптечку',
        checked: false
      },
      {
        type: 'divider',
        content: ''
      },
      {
        type: 'heading2',
        content: 'Локации и места'
      },
      {
        type: 'bullet',
        content: 'Исторический центр города и смотровая площадка'
      },
      {
        type: 'bullet',
        content: 'Местный ресторан с национальной кухней'
      }
    ]
  },
  {
    id: 'tmpl-study',
    title: 'Учеба, Расписание и Экзамены',
    icon: '🎓',
    category: 'study',
    description: 'База данных учебных дисциплин, дедлайнов курсовых, расписания экзаменов и оценок.',
    pageType: 'custom_database',
    initialDatabase: {
      properties: [
        {
          id: 'prop-status',
          name: 'Статус',
          type: 'select',
          options: [
            { id: 'opt-todo', label: 'К сдаче', color: 'bg-rose-100 text-rose-800' },
            { id: 'opt-progress', label: 'В процессе', color: 'bg-blue-100 text-blue-800' },
            { id: 'opt-done', label: 'Сдано', color: 'bg-emerald-100 text-emerald-800' }
          ]
        },
        { id: 'prop-subject', name: 'Предмет', type: 'text' },
        { id: 'prop-date', name: 'Дата сдачи / экзамена', type: 'date' },
        { id: 'prop-grade', name: 'Оценка (1-5)', type: 'rating' }
      ],
      items: [
        {
          title: 'Курсовая работа',
          properties: {
            'prop-status': 'opt-progress',
            'prop-subject': 'Программирование',
            'prop-date': addDays(getTodayString(), 20),
            'prop-grade': 5
          }
        },
        {
          title: 'Финальный экзамен',
          properties: {
            'prop-status': 'opt-todo',
            'prop-subject': 'Высшая математика',
            'prop-date': addDays(getTodayString(), 35),
            'prop-grade': 0
          }
        }
      ],
      defaultView: 'calendar',
      groupByPropertyId: 'prop-status',
      datePropertyId: 'prop-date'
    }
  }
];
