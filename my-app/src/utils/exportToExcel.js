import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
  // Преобразуем данные для экспорта
  const exportData = data.map(record => ({
    'Дата': new Date(record.date).toLocaleString('ru-RU'),
    'Оператор': record.operator,
    'Тип модели': record.modelType,
    '№ Блока': record.blockNumber,
    'Серийный номер': record.serialNumber,
    'Статус': getStatusText(record),
    'Успешных операций': getSuccessfulOperationsCount(record),
    'Всего операций': record.operations?.length || 0,
    'Комментарии': record.comments
  }));

  // Создаем второй лист для статистики
  const stats = calculateStats(data);
  const statsData = [
    ['Общая статистика'],
    ['Всего записей', data.length],
    ['', ''],
    ['Статистика по операторам'],
    ...Object.entries(stats.byOperator).map(([operator, count]) => [operator, count]),
    ['', ''],
    ['Статистика по моделям'],
    ...Object.entries(stats.byModel).map(([model, count]) => [model, count])
  ];

  // Создаем рабочую книгу
  const wb = XLSX.utils.book_new();
  
  // Добавляем лист с данными
  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, 'Данные');
  
  // Добавляем лист со статистикой
  const wsStats = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Статистика');

  // Устанавливаем ширину колонок
  const maxWidth = 20;
  ws['!cols'] = [
    { wch: 18 }, // Дата
    { wch: 15 }, // Оператор
    { wch: 15 }, // Тип модели
    { wch: 10 }, // № Блока
    { wch: 15 }, // Серийный номер
    { wch: 12 }, // Статус
    { wch: 10 }, // Успешных операций
    { wch: 10 }, // Всего операций
    { wch: maxWidth } // Комментарии
  ];

  // Сохраняем файл
  XLSX.writeFile(wb, `${filename}_${formatDate(new Date())}.xlsx`);
};

const getStatusText = (record) => {
  if (!record.operations?.length) return 'Не начато';
  const successCount = getSuccessfulOperationsCount(record);
  if (successCount === record.operations.length) return 'Завершено';
  if (successCount === 0) return 'Ошибка';
  return 'В процессе';
};

const getSuccessfulOperationsCount = (record) => {
  return record.operations?.filter(op => op.success)?.length || 0;
};

const calculateStats = (data) => {
  return data.reduce((acc, record) => {
    // Статистика по операторам
    acc.byOperator[record.operator] = (acc.byOperator[record.operator] || 0) + 1;
    
    // Статистика по моделям
    acc.byModel[record.modelType] = (acc.byModel[record.modelType] || 0) + 1;
    
    return acc;
  }, { byOperator: {}, byModel: {} });
};

const formatDate = (date) => {
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/[/:]/g, '_');
};