const Database = require('better-sqlite3');

class SQLiteService {
  constructor() {
    this.db = new Database('blocks.db');
    this.initDatabase();
  }

  initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        date TEXT,
        blockNumber TEXT UNIQUE,
        modelType TEXT,
        modemType TEXT,
        macAddress TEXT,
        operator TEXT,
        status TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        serverVersion INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blockId TEXT,
        name TEXT,
        success INTEGER,
        timestamp TEXT,
        executor TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        serverVersion INTEGER DEFAULT 0,
        FOREIGN KEY(blockId) REFERENCES blocks(id)
      );
    `);
  }

  getPendingChanges(since = null) {
    const blocksQuery = since
      ? 'SELECT * FROM blocks WHERE updatedAt > ? AND syncStatus != "synced"'
      : 'SELECT * FROM blocks WHERE syncStatus != "synced"';

    const operationsQuery = since
      ? 'SELECT * FROM operations WHERE updatedAt > ? AND syncStatus != "synced"'
      : 'SELECT * FROM operations WHERE syncStatus != "synced"';

    return {
      blocks: this.db.prepare(blocksQuery).all(since),
      operations: this.db.prepare(operationsQuery).all(since),
    };
  }

  applyServerChanges(changes) {
    const transaction = this.db.transaction(({ blocks, operations }) => {
      blocks.forEach(block => {
        const local = this.db.prepare('SELECT * FROM blocks WHERE id = ?').get(block.id);
        if (!local || block.serverVersion > local.serverVersion) {
          if (block.syncStatus === 'deleted') {
            this.db.prepare('DELETE FROM blocks WHERE id = ?').run(block.id);
          } else {
            this.db.prepare(`
              INSERT OR REPLACE INTO blocks (
                id, date, blockNumber, modelType, modemType, macAddress,
                operator, status, updatedAt, syncStatus, serverVersion
              ) VALUES (
                @id, @date, @blockNumber, @modelType, @modemType, @macAddress,
                @operator, @status, @updatedAt, 'synced', @serverVersion
              )
            `).run(block);
          }
        }
      });

      operations.forEach(op => {
        const local = this.db.prepare('SELECT * FROM operations WHERE id = ?').get(op.id);
        if (!local || op.serverVersion > local.serverVersion) {
          if (op.syncStatus === 'deleted') {
            this.db.prepare('DELETE FROM operations WHERE id = ?').run(op.id);
          } else {
            this.db.prepare(`
              INSERT OR REPLACE INTO operations (
                id, blockId, name, success, timestamp, executor, updatedAt,
                syncStatus, serverVersion
              ) VALUES (
                @id, @blockId, @name, @success, @timestamp, @executor, @updatedAt,
                'synced', @serverVersion
              )
            `).run(op);
          }
        }
      });
    });

    transaction(changes);
  }

  markAsSynced(changes) {
    const tx = this.db.transaction(() => {
      if (changes.blocks?.length) {
        const ids = changes.blocks.map(b => b.id);
        this.db.prepare(`UPDATE blocks SET syncStatus = 'synced' WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
      }

      if (changes.operations?.length) {
        const ids = changes.operations.map(o => o.id);
        this.db.prepare(`UPDATE operations SET syncStatus = 'synced' WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
      }
    });

    tx();
  }
}

module.exports = new SQLiteService();
