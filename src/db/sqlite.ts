import initSqlJs, { type Database as SqlJsDatabase, type SqlJsStatic } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import databaseUrl from "./casual-scheduler.db?url";

const STORAGE_KEY = "casual-scheduler-db";

type SqlRow = Record<string, unknown>;

let sqlJsPromise: Promise<SqlJsStatic> | null = null;
let databasePromise: Promise<SqlJsDatabase> | null = null;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: () => sqlWasmUrl,
    });
  }

  return sqlJsPromise;
}

async function loadDatabaseBytes() {
  if (typeof window !== "undefined") {
    const storedBytes = window.localStorage.getItem(STORAGE_KEY);

    if (storedBytes) {
      return base64ToBytes(storedBytes);
    }
  }

  const response = await fetch(databaseUrl);
  return new Uint8Array(await response.arrayBuffer());
}

async function persistDatabase(database: { export: () => Uint8Array }) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, bytesToBase64(database.export()));
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const SQL = await getSqlJs();
      const bytes = await loadDatabaseBytes();

      return new SQL.Database(bytes);
    })();
  }

  return databasePromise;
}

export async function queryRows<T extends SqlRow = SqlRow>(
  sql: string,
  params: ReadonlyArray<unknown> = [],
) {
  const database = await getDatabase();
  const statement = database.prepare(sql);

  try {
    if (params.length > 0) {
      statement.bind(params);
    }

    const rows: T[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject() as T);
    }

    return rows;
  } finally {
    statement.free();
  }
}

export async function runSql(sql: string, params: ReadonlyArray<unknown> = []) {
  const database = await getDatabase();

  database.run(sql, params);
  await persistDatabase(database);
}

export async function resetDatabase() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  databasePromise = null;
}