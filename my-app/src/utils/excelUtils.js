import * as XLSX from 'xlsx';

export const parseExcelReport = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Получаем первый лист
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Преобразуем в JSON с пропуском пустых строк
        const rawData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: null,
          blankrows: false,
          raw: false // Отключаем автоматическую конвертацию типов
        });

        // Проверяем наличие обязательных колонок
        const requiredColumns = ['Дата', 'Оператор', 'Тип модели'];
        const missingColumns = requiredColumns.filter(col => 
          !rawData[0] || !(col in rawData[0])
        );

        if (missingColumns.length > 0) {
          throw new Error('Отсутствуют обязательные колонки: ' + missingColumns.join(', '));
        }

        // Обрабатываем данные
        const records = rawData
          .filter(row => row['Дата'] || row['Оператор']) // Пропускаем пустые строки
          .map(row => ({
            date: parseDate(row['Дата']),
            operator: row['Оператор'] || 'Не указан',
            modelType: row['Тип модели'] || 'Не указан',
            blockNumber: row['№ Блока'] || String(Date.now()),
            serialNumber: row['Серийный номер'] || '',
            status: row['Статус'] || 'pending',
            operations: parseOperations(row),
            comments: row['Комментарии'] || ''
          }));

        resolve(records);
      } catch (error) {
        reject(new Error('Ошибка при обработке файла: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsArrayBuffer(file);
  });
};

// Функция для парсинга даты из разных форматов
const parseDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString();

  // Пробуем разные форматы даты
  const formats = [
    dateStr => new Date(dateStr),
    dateStr => {
      const [day, month, year] = dateStr.split('.').map(Number);
      return new Date(year, month - 1, day);
    },
    dateStr => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
  ];

  for (const format of formats) {
    try {
      const date = format(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      continue;
    }
  }

  return new Date().toISOString();
};

const parseOperations = (row) => {
  const operations = [];
  const operationFields = [
    { name: 'Прошивка', field: 'Прошивка' },
    { name: 'Настройка', field: 'Настройка' },
    { name: 'Замер мощности', field: 'Замер мощности' },
    { name: 'Проверка бюджета', field: 'Бюджет' },
    { name: 'Климатические испытания', field: 'Климатика' },
    { name: 'Холодный старт', field: 'Холодный старт' },
    { name: 'Горячий старт', field: 'Горячий старт' },
    { name: 'Установка RSSI', field: 'RSSI' },
    { name: 'Контроль качества', field: 'Контроль' }
  ];

  operationFields.forEach(({ name, field }) => {
    if (field in row && row[field] !== null && row[field] !== '') {
      const success = isOperationSuccessful(row[field]);
      operations.push({
        name,
        success,
        timestamp: new Date().toISOString(),
        result: row[field + ' результат'] || '',
        duration: 0
      });
    }
  });

  return operations;
};

const isOperationSuccessful = (value) => {
  if (!value) return false;
  const successValues = ['да', 'успешно', 'выполнено', 'ok', 'ок', '+', 'true', '1'];
  return successValues.includes(String(value).toLowerCase().trim());
};

// Функция для экспорта данных в Excel
export const exportToExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Отчет');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};