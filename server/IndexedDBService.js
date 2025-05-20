class IndexedDBService {
  constructor() {
    this.dbName = 'blocksDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Создаем хранилище для блоков
        if (!db.objectStoreNames.contains('blocks')) {
          const blockStore = db.createObjectStore('blocks', { keyPath: 'id' });
          blockStore.createIndex('blockNumber', 'blockNumber', { unique: true });
          blockStore.createIndex('operator', 'operator', { unique: false });
          blockStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          blockStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Создаем хранилище для операций
        if (!db.objectStoreNames.contains('operations')) {
          const operationStore = db.createObjectStore('operations', { keyPath: 'id', autoIncrement: true });
          operationStore.createIndex('blockId', 'blockId', { unique: false });
          operationStore.createIndex('timestamp', 'timestamp', { unique: false });
          operationStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          operationStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async getAllBlocks() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readonly');
      const blockStore = transaction.objectStore('blocks');
      const operationStore = transaction.objectStore('operations');
      const blocks = [];
      const operationsByBlock = new Map();

      // Сначала получаем все операции
      operationStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const operation = cursor.value;
          if (!operationsByBlock.has(operation.blockId)) {
            operationsByBlock.set(operation.blockId, []);
          }
          operationsByBlock.get(operation.blockId).push(operation);
          cursor.continue();
        } else {
          // После получения всех операций, получаем блоки
          blockStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const block = cursor.value;
              block.operations = (operationsByBlock.get(block.id) || []).map(op => ({
                name: op.name,
                success: op.success,
                timestamp: op.timestamp,
                executor: op.executor || null // возвращаем executor
              }));
              blocks.push(block);
              cursor.continue();
            } else {
              resolve(blocks);
            }
          };
        }
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getBlockById(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readonly');
      
      transaction.objectStore('blocks').get(id).onsuccess = (event) => {
        const block = event.target.result;
        if (!block) {
          reject(new Error(`Блок с ID ${id} не найден`));
          return;
        }

        transaction.objectStore('operations').index('blockId').getAll(id).onsuccess = (e) => {
          resolve({
            ...block,
            operations: e.target.result.map(op => ({
              name: op.name,
              success: op.success,
              timestamp: op.timestamp,
              executor: op.executor || null // возвращаем executor
            }))
          });
        };
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addBlock(block) {
    await this.init();
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readwrite');
      const blockStore = transaction.objectStore('blocks');
      const operationStore = transaction.objectStore('operations');

      // Подготавливаем блок для сохранения
      const blockToSave = {
        ...block,
        createdAt: block.createdAt || now,
        updatedAt: now,
        syncStatus: block.syncStatus || 'pending'
      };

      // Сохраняем операции отдельно
      const operations = block.operations || [];
      delete blockToSave.operations;

      const blockRequest = blockStore.put(blockToSave);

      blockRequest.onerror = () => reject(blockRequest.error);
      blockRequest.onsuccess = () => {
        // Сохраняем операции с ссылкой на блок
        const operationPromises = operations.map(operation => 
          new Promise((resolveOp, rejectOp) => {
            const operationToSave = {
              ...operation,
              blockId: blockToSave.id,
              executor: operation.executor || blockToSave.operator || null, // сохраняем executor
              createdAt: operation.createdAt || now,
              updatedAt: now,
              syncStatus: operation.syncStatus || 'pending'
            };

            const opRequest = operationStore.add(operationToSave);
            opRequest.onerror = () => rejectOp(opRequest.error);
            opRequest.onsuccess = () => resolveOp(opRequest.result);
          })
        );

        Promise.all(operationPromises)
          .then(() => resolve(blockToSave))
          .catch(reject);
      };

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve(blockToSave);
    });
  }

  async updateBlock(id, updatedBlock) {
    await this.init();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readwrite');
      
      const blockToUpdate = {
        ...updatedBlock,
        id,
        updatedAt: now,
        syncStatus: 'pending'
      };

      const blockStore = transaction.objectStore('blocks');
      const operationsStore = transaction.objectStore('operations');

      // Обновляем блок
      blockStore.put(blockToUpdate).onsuccess = () => {
        // Удаляем старые операции
        operationsStore.index('blockId').openCursor(id).onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            // Добавляем новые операции
            if (updatedBlock.operations && updatedBlock.operations.length > 0) {
              const operations = updatedBlock.operations.map(op => ({
                blockId: id,
                name: op.name,
                success: op.success,
                timestamp: op.timestamp,
                executor: op.executor || blockToUpdate.operator || null, // сохраняем executor
                updatedAt: now,
                syncStatus: 'pending'
              }));

              let completed = 0;
              operations.forEach(op => {
                operationsStore.add(op).onsuccess = () => {
                  completed++;
                  if (completed === operations.length) {
                    resolve(updatedBlock);
                  }
                };
              });
            } else {
              resolve(updatedBlock);
            }
          }
        };
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteBlock(id) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readwrite');

      // Удаляем блок
      transaction.objectStore('blocks').delete(id);

      // Удаляем связанные операции
      const operationsStore = transaction.objectStore('operations');
      const index = operationsStore.index('blockId');
      const request = index.openCursor(id);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getBlocksByOperator(operator) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readonly');
      const blocks = [];
      
      transaction.objectStore('blocks').index('operator').openCursor(operator).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const block = cursor.value;
          transaction.objectStore('operations').index('blockId').getAll(block.id).onsuccess = (e) => {
            blocks.push({
              ...block,
              operations: e.target.result.map(op => ({
                name: op.name,
                success: op.success,
                timestamp: op.timestamp,
                executor: op.executor || null // возвращаем executor
              }))
            });
          };
          cursor.continue();
        } else {
          resolve(blocks);
        }
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPendingChanges(since = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readonly');
      const changes = {
        blocks: [],
        operations: []
      };

      // Получаем измененные блоки
      const blockRequest = transaction.objectStore('blocks').index('syncStatus').openCursor('pending');
      blockRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const block = cursor.value;
          if (!since || block.updatedAt > since) {
            changes.blocks.push(block);
          }
          cursor.continue();
        } else {
          // Получаем измененные операции после получения всех блоков
          const operationRequest = transaction.objectStore('operations').index('syncStatus').openCursor('pending');
          operationRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const operation = cursor.value;
              if (!since || operation.updatedAt > since) {
                changes.operations.push(operation);
              }
              cursor.continue();
            } else {
              resolve(changes);
            }
          };
        }
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async applyServerChanges(changes) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readwrite');
      const blockStore = transaction.objectStore('blocks');
      const operationStore = transaction.objectStore('operations');

      let completed = 0;
      const total = changes.blocks.length + changes.operations.length;

      // Применяем изменения блоков
      changes.blocks.forEach(block => {
        blockStore.get(block.id).onsuccess = (event) => {
          const existing = event.target.result;
          if (!existing || block.serverVersion > existing.serverVersion) {
            if (block.syncStatus === 'deleted') {
              blockStore.delete(block.id).onsuccess = () => {
                completed++;
                if (completed === total) resolve(true);
              };
            } else {
              blockStore.put({
                ...block,
                syncStatus: 'synced'
              }).onsuccess = () => {
                completed++;
                if (completed === total) resolve(true);
              };
            }
          } else {
            completed++;
            if (completed === total) resolve(true);
          }
        };
      });

      // Применяем изменения операций
      changes.operations.forEach(operation => {
        if (operation.syncStatus === 'deleted') {
          operationStore.delete(operation.id).onsuccess = () => {
            completed++;
            if (completed === total) resolve(true);
          };
        } else {
          operationStore.put({
            ...operation,
            syncStatus: 'synced'
          }).onsuccess = () => {
            completed++;
            if (completed === total) resolve(true);
          };
        }
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async markAsSynced(changes) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['blocks', 'operations'], 'readwrite');
      
      let completed = 0;
      const total = changes.blocks.length + changes.operations.length;

      // Помечаем блоки как синхронизированные
      changes.blocks.forEach(block => {
        const request = transaction.objectStore('blocks').get(block.id);
        request.onsuccess = () => {
          const existing = request.result;
          if (existing) {
            existing.syncStatus = 'synced';
            transaction.objectStore('blocks').put(existing).onsuccess = () => {
              completed++;
              if (completed === total) resolve(true);
            };
          } else {
            completed++;
            if (completed === total) resolve(true);
          }
        };
      });

      // Помечаем операции как синхронизированные
      changes.operations.forEach(operation => {
        const request = transaction.objectStore('operations').get(operation.id);
        request.onsuccess = () => {
          const existing = request.result;
          if (existing) {
            existing.syncStatus = 'synced';
            transaction.objectStore('operations').put(existing).onsuccess = () => {
              completed++;
              if (completed === total) resolve(true);
            };
          } else {
            completed++;
            if (completed === total) resolve(true);
          }
        };
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();