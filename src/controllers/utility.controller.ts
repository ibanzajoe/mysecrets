import { Request, Response } from 'express';
import { db as pool } from '../db';
import { sql } from 'slonik';

export const getTableInformation = async (req: Request, res: Response) => {
  try {
    const tables = await pool.query(sql.unsafe`
        SELECT table_name FROM information_schema.tables WHERE table_schema='public'
    `);

    return tables;
  } catch (error) {
    throw new Error(`Error retrieving table information: ${error}`)
  }
}