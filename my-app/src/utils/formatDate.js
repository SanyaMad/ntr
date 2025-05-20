import { parseISO, format, isValid } from 'date-fns';
import ru from 'date-fns/locale/ru';

const formatDate = (date) => {
  try {
    if (!date) return 'Дата отсутствует';
    const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(parsed)) return 'Неверная дата';
    return format(parsed, 'dd MMMM yyyy г.', { locale: ru });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Неверная дата';
  }
};

export default formatDate;