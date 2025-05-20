import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
  // Подготовка данных для записей
  const recordsData = data.records.map(record => ({
    'ID': record.id,
    'Дата': new Date(record.date).toLocaleString(),
    'Оператор': record.operator,
    'Тип модели': record.modelType,
    'Статус': getStatusText(record),
    'Успешность': calculateSuccessRate(record),
    'Длительность (сек)': record.duration ? Math.round(record.duration / 1000) : 0
  }));

  // Подготовка данных статистики
  const statsData = [
    ['Общая статистика', ''],
    ['Всего операций', data.statistics.total],
    ['Успешных операций', data.statistics.successful],
    ['Неуспешных операций', data.statistics.failed],
    ['Средняя длительность (сек)', Math.round(data.statistics.averageDuration / 1000)],
    ['', ''],
    ['Статистика по операторам', ''],
    ...Object.entries(data.statistics.byOperator || {}).map(([operator, count]) => [operator, count])
  ];

  // Создание рабочей книги
  const wb = XLSX.utils.book_new();
  
  // Добавление листа с записями
  const wsRecords = XLSX.utils.json_to_sheet(recordsData);
  XLSX.utils.book_append_sheet(wb, wsRecords, 'Записи');
  
  // Добавление листа со статистикой
  const wsStats = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Статистика');

  // Сохранение файла
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const getStatusText = (record) => {
  if (!record.operations?.length) return 'Не начато';
  if (record.operations.length === record.totalOperations) return 'Завершено';
  if (record.operations.some(op => !op.success)) return 'Ошибка';
  return 'В процессе';
};

const calculateSuccessRate = (record) => {
  if (!record.operations?.length) return '0%';
  const successful = record.operations.filter(op => op.success).length;
  return `${Math.round(successful / record.operations.length * 100)}%`;
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRecords = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'DD.MM.YYYY'
        });
        resolve(rawRecords); // Исправлено: добавлен возврат rawRecords
      } catch (error) {
        reject(new Error('Ошибка при импорте файла: ' + error.message)); // Исправлено: добавлена обработка ошибок
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
};

// Вспомогательная функция для парсинга даты
const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();
  
  // Пробуем разные форматы даты
  const formats = [
    'DD.MM.YYYY',
    'DD-MM-YYYY',
    'YYYY-MM-DD',
    'DD/MM/YYYY'
  ];

  for (const format of formats) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return new Date().toISOString();
};

// Вспомогательная функция для определения успешности операции
const isOperationSuccessful = (value) => {
  if (!value) return false;
  const successValues = ['да', 'успешно', 'выполнено', 'ok', 'ок', '+'];
  return successValues.includes(String(value).toLowerCase().trim());
};

export const saveFileToLocalStorage = (key, file) => {
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(key, reader.result);
  };
  reader.readAsDataURL(file);
};
