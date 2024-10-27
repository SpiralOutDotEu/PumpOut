/* eslint-disable @typescript-eslint/no-explicit-any */
import sqlite3 from "sqlite3";
import { open, Database as SqliteDatabase } from "sqlite";
import { DatabaseInterface, TokenData } from "./DatabaseInterface";

class SQLiteDatabase implements DatabaseInterface {
    private dbPromise: Promise<SqliteDatabase<sqlite3.Database, sqlite3.Statement>>;

    constructor() {
        this.dbPromise = this.init();
    }

    private async init(): Promise<SqliteDatabase<sqlite3.Database, sqlite3.Statement>> {
        const db = await open<sqlite3.Database, sqlite3.Statement>({
            filename: "./database.sqlite",
            driver: sqlite3.Database,
        });
        await db.exec(`
        CREATE TABLE IF NOT EXISTS tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          network TEXT,
          tokenAddress TEXT UNIQUE,
          name TEXT,
          symbol TEXT,
          nttDeployment JSON DEFAULT NULL,
          lpData JSON DEFAULT NULL,
          logo TEXT DEFAULT NULL
        )
      `);
        return db;
    }

    public async addToken(data: TokenData): Promise<void> {
        const db = await this.dbPromise;
        await db.run(
            `INSERT INTO tokens (network, tokenAddress, name, symbol, nttDeployment, lpData, logo) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
            data.network,
            data.tokenAddress,
            data.name,
            data.symbol,
            data.nttDeployment ? JSON.stringify(data.nttDeployment) : null,
            data.lpData ? JSON.stringify(data.lpData) : null,
            data.logo || null
        );
    }

    public async getTokenByAddress(tokenAddress: string): Promise<TokenData | null> {
        const db = await this.dbPromise;
        const row = await db.get(
            `SELECT network, tokenAddress, name, symbol, nttDeployment, lpData, logo 
         FROM tokens WHERE tokenAddress = ?`,
            tokenAddress
        );
        return row
            ? {
                ...row,
                nttDeployment: row.nttDeployment ? JSON.parse(row.nttDeployment) : undefined,
                lpData: row.lpData ? JSON.parse(row.lpData) : undefined,
            }
            : null;
    }

    public async updateNttDeployment(network: string, tokenAddress: string, nttDeployment: Record<string, any>): Promise<void> {
        const db = await this.dbPromise;
        await db.run(
            `UPDATE tokens SET nttDeployment = ? WHERE tokenAddress = ? AND network = ?`,
            JSON.stringify(nttDeployment),
            tokenAddress,
            network
        );
    }

    public async updateLpData(network: string, tokenAddress: string, lpData: Record<string, any>): Promise<void> {
        const db = await this.dbPromise;
        await db.run(
            `UPDATE tokens SET lpData = ? WHERE tokenAddress = ? AND network = ?`,
            JSON.stringify(lpData),
            tokenAddress,
            network
        );
    }

    public async close(): Promise<void> {
        const db = await this.dbPromise;
        await db.close();
    }
}

export const sqliteDatabase = new SQLiteDatabase();