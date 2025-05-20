import formatDate from './formatDate';

const formatOperations = (operations) => {
  if (!Array.isArray(operations)) return '';
  
  return operations.map(op => {
    if (!op) return '';
    return `${op.name || ''} (${op.success ? 'Успешно' : 'Ошибка'})`;
  }).join('; ');
};

const formatValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' && value.includes(',')) {
    return `"${value}"`;
  }
  return value;
};

const exportToCSV = (records) => {
  try {
    // Добавляем BOM для корректного отображения кириллицы в Excel
    const BOM = '\uFEFF';
    
    const headers = [
      'ID',
      'Дата',
      'Тип модели',
      'Тип модема',
      'Номер блока',
      'MAC адрес',
      'Оператор',
      'Операции',
      'Статус'
    ];

    const rows = records.map(record => [
      formatValue(record.id),
      formatValue(formatDate(record.date)),
      formatValue(record.modelType),
      formatValue(record.modemType),
      formatValue(record.blockNumber),
      formatValue(record.macAddress),
      formatValue(record.operator),
      formatValue(formatOperations(record.operations)),
      formatValue(record.status)
    ]);

    const csvContent = BOM + [headers, ...rows]
      .map(row => row.join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });

    const link = document.createElement('a');
    const fileName = `blocks_export_${formatDate(new Date())}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error('Ошибка экспорта в CSV:', error);
    throw new Error('Не удалось экспортировать данные');
  }
};

export default exportToCSV;