// Операторы
export const OPERATORS = [
    "Колкунов П. О.",
    "Мухамедшин А. Н.",
    "Темляков Д. Н.",
    "Беспалов А. Н.",
    "Удимов Д. Р.",
    "Карабанов В. В.",
    "Бубнов Р. В.",
    "Смирнова А. С.",
    "Меньшеков А.В.",
    "Андреев Н.Н."
];

export const MODEL_TYPES = [
  'Модель 1',
  'Модель 2',
  'Модель 3'
];

export const MODEM_TYPES = [
  'Модем A',
  'Модем B',
  'Модем C'
];

export const EXECUTION_TYPES = [
  'Исполнение X',
  'Исполнение Y',
  'Исполнение Z'
];

export const BLOCK_TYPES = [
  'Тип 1',
  'Тип 2',
  'Тип 3'
];

// Операции
export const OPERATIONS = [
    'Прошивка',
    'Настройка',
    'Замер мощности',
    'Бюджет', 
    'Климатика',
    'Холодный старт',
    'Горячий старт',
    'Установка RSSI',
    'Контроль перед упаковкой'
];

// Статусы операций
export const OPERATION_STATUSES = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Обязательные поля для импорта
export const REQUIRED_IMPORT_FIELDS = ['modelType', 'blockNumber'];

// Инициализация паролей операторов
const initializeOperatorPasswords = () => {
    const savedPasswords = localStorage.getItem('OPERATOR_PASSWORDS');
    if (savedPasswords) {
        return JSON.parse(savedPasswords);
    }
    const initialPasswords = Object.fromEntries(
        OPERATORS.map(operator => [operator, '0000'])
    );
    localStorage.setItem('OPERATOR_PASSWORDS', JSON.stringify(initialPasswords));
    return initialPasswords;
};

export const OPERATOR_PASSWORDS = initializeOperatorPasswords();

export const STORAGE_KEY = 'workRecords';
export const OPERATOR_STORAGE_KEY = 'currentOperator';

// Маппинг колонок Excel
export const EXCEL_COLUMN_MAPPING = {
  'Тип модели': 'modelType',
  'Model Type': 'modelType',
  'Номер блока': 'blockNumber',
  'Block Number': 'blockNumber',
  'Тип модема': 'modemType',
  'MAC адрес': 'macAddress',
  'Оператор': 'operator',
  'Дата': 'date'
};

// Валидация для импорта из Excel
export const EXCEL_VALIDATION_RULES = {
  modelType: {
    required: true,
    validate: value => MODEL_TYPES.includes(value),
    error: 'Недопустимый тип модели'
  },
  blockNumber: {
    required: true,
    validate: value => /^\d+$/.test(value),
    error: 'Номер блока должен содержать только цифры'
  },
  macAddress: {
    required: false,
    validate: value => !value || /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value),
    error: 'Неверный формат MAC-адреса'
  }
};