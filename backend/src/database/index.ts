import sqlite3 from "sqlite3";

// // Replace this line
// export default new Database();

// // With this line, after implementing PostgresDatabase
// import PostgresDatabase from './postgresDatabase';
// export default new PostgresDatabase();

export interface DatabaseInterface {
  insertCall(taskType: string, params: any, status: string): Promise<number>;
  updateCall(id: number, status: string, result: any): Promise<void>;
  getCallById(id: number): Promise<any>;
}

class Database implements DatabaseInterface {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = process.env.DATABASE_URL || "./data.sqlite3";
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Could not connect to database", err);
      } else {
        console.log("Connected to SQLite database");
        this.initialize();
      }
    });
  }

  private initialize(): void {
    const createCallsTable = `
      CREATE TABLE IF NOT EXISTS calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_type TEXT,
        params TEXT,
        status TEXT,
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createProcessedEventsTable = `
    CREATE TABLE IF NOT EXISTS processed_events (
      event_hash TEXT PRIMARY KEY,
      processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    const createLastBlockTable = `
      CREATE TABLE IF NOT EXISTS last_block (
        network TEXT PRIMARY KEY,
        last_block INTEGER
      )
    `;

    this.db.run(createLastBlockTable);
    this.db.run(createProcessedEventsTable);
    this.db.run(createCallsTable);
  }

  insertCall(taskType: string, params: any, status: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO calls (task_type, params, status) VALUES (?, ?, ?)`;
      this.db.run(
        query,
        [taskType, JSON.stringify(params), status],
        function (this: sqlite3.RunResult, err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  updateCall(id: number, status: string, result: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE calls SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      this.db.run(query, [status, JSON.stringify(result), id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getCallById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM calls WHERE id = ?`;
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Method to check if an event has been processed
  isEventProcessed(eventHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(1) AS count FROM processed_events WHERE event_hash = ?`;
      this.db.get(query, [eventHash], (err, row: { count: number }) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);  // Return true if the event has been processed
        }
      });
    });
  }

  // Method to mark an event as processed
  markEventAsProcessed(eventHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO processed_events (event_hash) VALUES (?)`;
      this.db.run(query, [eventHash], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Method to get the last block processed for a specific network
  getLastBlock(network: string): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT last_block FROM last_block WHERE network = ?`;
      this.db.get(query, [network], (err, row: { last_block: number }) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.last_block : null);  // Return the last block if exists, otherwise null
        }
      });
    });
  }

  // Method to update the last block processed for a specific network
  updateLastBlock(network: string, blockNumber: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
          INSERT INTO last_block (network, last_block) 
          VALUES (?, ?)
          ON CONFLICT(network) DO UPDATE SET last_block = excluded.last_block
        `;
      this.db.run(query, [network, blockNumber], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new Database();
