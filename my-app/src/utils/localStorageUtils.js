export const saveFileToLocalStorage = (key, file) => {
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(key, reader.result); // Сохраняем файл в локальное хранилище
  };
  reader.readAsDataURL(file); // Читаем файл как Data URL
};

export const getFileFromLocalStorage = (key) => {
  const fileData = localStorage.getItem(key);
  if (!fileData) {
    console.error(`Файл с ключом "${key}" не найден в localStorage.`);
    return null;
  }
  return fileData;
};
