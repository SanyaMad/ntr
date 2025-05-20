const sqliteService = require('./SQLiteService');
const fetch = require('node-fetch');

class SyncService {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  async synchronize() {
    const localChanges = await sqliteService.getPendingChanges();

    const response = await fetch(`${this.serverUrl}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localChanges)
    });

    if (!response.ok) {
      throw new Error('Ошибка при синхронизации с сервером');
    }

    const serverChanges = await response.json();
    await sqliteService.applyServerChanges(serverChanges);
    await sqliteService.markAsSynced(localChanges);
  }
}

module.exports = SyncService;
