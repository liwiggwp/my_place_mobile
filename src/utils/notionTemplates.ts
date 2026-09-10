import type { NotionPage, NotionDatabase, WorkspaceTemplate } from '../types/notion';
import { getTodayString, addDays } from './dateUtils';

export const DEFAULT_DATABASES: NotionDatabase[] = [
  // 1. Фильмы, Сериалы и Дорамы
  {
    id: 'db-cinema',
    name: 'Фильмы, Сериалы и Дорамы',
    icon: '🍿',
    description: 'Учет просмотренных и запланированных фильмов, дорам, аниме и сериалов',
    properties: [
      {
        id: 'prop-type',
        name: 'Категория',
        type: 'select',
        options: [
          { id: 'opt-movie', label: '🎬 Фильм', color: 'bg-blue-100 text-blue-800' },
          { id: 'opt-dorama', label: '🌸 Дорама', color: 'bg-pink-100 text-pink-800' },
          { id: 'opt-series', label: '📺 Сериал', color: 'bg-purple-100 text-purple-800' },
          { id: 'opt-anime', label: '🎌 Аниме', color: 'bg-orange-100 text-orange-800' },
          { id: 'opt-cartoon', label: '🎭 Мультфильм', color: 'bg-amber-100 text-amber-800' }
        ]
      },
      {
        id: 'prop-status',
        name: 'Статус',
        type: 'select',
        options: [
          { id: 'opt-watching', label: '🍿 Смотрю сейчас', color: 'bg-blue-100 text-blue-800' },
          { id: 'opt-plan', label: '⏳ В планах', color: 'bg-amber-100 text-amber-800' },
          { id: 'opt-done', label: '✅ Просмотрено', color: 'bg-emerald-100 text-emerald-800' },
          { id: 'opt-pause', label: '⏸️ На паузе', color: 'bg-slate-100 text-slate-800' }
        ]
      },
      {
        id: 'prop-rating',
        name: 'Оценка (1-5)',
        type: 'rating'
      },
      {
        id: 'prop-genre',
        name: 'Жанр',
        type: 'text'
      },
      {
        id: 'prop-progress',
        name: 'Серии / Прогресс',
        type: 'text'
      },
      {
        id: 'prop-date',
        name: 'Дата просмотра / выхода',
        type: 'date'
      }
    ],
    items: [
      {
        id: 'item-c1',
        title: 'Истинная красота (True Beauty)',
        properties: {
          'prop-type': 'opt-dorama',
          'prop-status': 'opt-watching',
          'prop-rating': 5,
          'prop-genre': 'Романтика, школа, комедия',
          'prop-progress': '12 из 16 серий',
          'prop-date': getTodayString()
        },
        blocks: [
          {
            id: 'b-c1-1',
            type: 'callout',
            icon: '🌸',
            color: 'rose',
            content: 'Очень милая и веселая дорама про самооценку, дружбу и первую любовь.',
            createdAt: new Date().toISOString()
          },
          {
            id: 'b-c1-2',
            type: 'heading2',
            content: 'Любимые моменты и персонажи',
            createdAt: new Date().toISOString()
          },
          {
            id: 'b-c1-3',
            type: 'bullet',
            content: 'Хан Со Джун — харизматичный бунтарь с добрым сердцем',
            createdAt: new Date().toISOString()
          },
          {
            id: 'b-c1-4',
            type: 'bullet',
            content: 'Смешные сцены с преображением в школе',
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'item-c2',
        title: 'Аватар: Путь воды',
        properties: {
          'prop-type': 'opt-movie',
          'prop-status': 'opt-done',
          'prop-rating': 5,
          'prop-genre': 'Фантастика, приключения',
          'prop-progress': 'Полнометражный фильм',
          'prop-date': addDays(getTodayString(), -5)
        },
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'item-c3',
        title: 'Игра в кальмара (2 сезон)',
        properties: {
          'prop-type': 'opt-series',
          'prop-status': 'opt-plan',
          'prop-rating': 0,
          'prop-genre': 'Триллер, драма',
          'prop-progress': 'В ожидании выхода',
          'prop-date': addDays(getTodayString(), 20)
        },
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'item-c4',
        title: 'Унесенные призраками',
        properties: {
          'prop-type': 'opt-anime',
          'prop-status': 'opt-done',
          'prop-rating': 5,
          'prop-genre': 'Фэнтези, классика Миядзаки',
          'prop-progress': 'Шедевр',
          'prop-date': addDays(getTodayString(), -15)
        },
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    defaultView: 'gallery',
    groupByPropertyId: 'prop-status',
    datePropertyId: 'prop-date'
  },

  // 2. Книжная полка
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
  // 1. Популярные кастомные базы
  {
    id: 'page-custom-cinema',
    title: 'Фильмы, Сериалы и Дорамы',
    icon: '🍿',
    type: 'custom_database',
    databaseId: 'db-cinema',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
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

  // 2. Встроенные хабы
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

  // 3. Заметки
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
  // 1. Фильмы, Сериалы и Дорамы
  {
    id: 'tmpl-cinema',
    title: 'Фильмы, Сериалы и Дорамы',
    icon: '🍿',
    category: 'lifestyle',
    description: 'Учет фильмов, дорам, аниме и сериалов по категориям, со статусом («Смотрю», «В планах», «Просмотрено»), рейтингом ⭐️ и прогрессом серий.',
    badge: 'Популярное',
    pageType: 'custom_database',
    initialDatabase: {
      properties: [
        {
          id: 'prop-type',
          name: 'Категория',
          type: 'select',
          options: [
            { id: 'opt-movie', label: '🎬 Фильм', color: 'bg-blue-100 text-blue-800' },
            { id: 'opt-dorama', label: '🌸 Дорама', color: 'bg-pink-100 text-pink-800' },
            { id: 'opt-series', label: '📺 Сериал', color: 'bg-purple-100 text-purple-800' },
            { id: 'opt-anime', label: '🎌 Аниме', color: 'bg-orange-100 text-orange-800' },
            { id: 'opt-cartoon', label: '🎭 Мультфильм', color: 'bg-amber-100 text-amber-800' }
          ]
        },
        {
          id: 'prop-status',
          name: 'Статус',
          type: 'select',
          options: [
            { id: 'opt-watching', label: '🍿 Смотрю сейчас', color: 'bg-blue-100 text-blue-800' },
            { id: 'opt-plan', label: '⏳ В планах', color: 'bg-amber-100 text-amber-800' },
            { id: 'opt-done', label: '✅ Просмотрено', color: 'bg-emerald-100 text-emerald-800' },
            { id: 'opt-pause', label: '⏸️ На паузе', color: 'bg-slate-100 text-slate-800' }
          ]
        },
        { id: 'prop-rating', name: 'Оценка (1-5)', type: 'rating' },
        { id: 'prop-genre', name: 'Жанр', type: 'text' },
        { id: 'prop-progress', name: 'Серии / Прогресс', type: 'text' },
        { id: 'prop-date', name: 'Дата', type: 'date' }
      ],
      items: [
        {
          title: 'Истинная красота (True Beauty)',
          properties: {
            'prop-type': 'opt-dorama',
            'prop-status': 'opt-watching',
            'prop-rating': 5,
            'prop-genre': 'Романтика, комедия',
            'prop-progress': '12 из 16 серий',
            'prop-date': getTodayString()
          }
        },
        {
          title: 'Аватар: Путь воды',
          properties: {
            'prop-type': 'opt-movie',
            'prop-status': 'opt-done',
            'prop-rating': 5,
            'prop-genre': 'Фантастика',
            'prop-progress': 'Полный фильм',
            'prop-date': getTodayString()
          }
        }
      ],
      defaultView: 'gallery',
      groupByPropertyId: 'prop-status',
      datePropertyId: 'prop-date'
    }
  },

  // 2. Книжная полка
  {
    id: 'tmpl-books',
    title: 'Книжная полка',
    icon: '📚',
    category: 'lifestyle',
    description: 'База данных с канбан-доской: статус («Читаю», «В планах», «Прочитано»), рейтинг ⭐️ и автор.',
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
        { id: 'prop-author', name: 'Автор', type: 'text' },
        { id: 'prop-rating', name: 'Оценка', type: 'rating' },
        { id: 'prop-date', name: 'Дата', type: 'date' }
      ],
      items: [
        {
          title: 'Атомные привычки',
          properties: {
            'prop-status': 'opt-reading',
            'prop-author': 'Джеймс Клир',
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

  // 3. Цели на год
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
        }
      ],
      defaultView: 'calendar',
      groupByPropertyId: 'prop-status',
      datePropertyId: 'prop-deadline'
    }
  },

  // 4. План путешествия
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
      }
    ]
  },

  // 5. Учеба
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
        }
      ],
      defaultView: 'calendar',
      groupByPropertyId: 'prop-status',
      datePropertyId: 'prop-date'
    }
  },

  // 6. Встроенные хабы
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
  }
];
