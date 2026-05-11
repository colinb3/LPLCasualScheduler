declare module "sql.js" {
  export interface Statement {
    bind(values: ReadonlyArray<unknown>): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  export interface Database {
    prepare(sql: string): Statement;
    run(sql: string, params?: ReadonlyArray<unknown>): void;
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array | ArrayBuffer | string) => Database;
  }

  export interface SqlJsConfig {
    locateFile(file: string): string;
  }

  export default function initSqlJs(
    config?: SqlJsConfig,
  ): Promise<SqlJsStatic>;
}