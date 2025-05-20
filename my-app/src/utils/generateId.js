export default function generateId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}