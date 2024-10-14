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
}

export default new Database();
