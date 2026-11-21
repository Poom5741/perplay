// State store — JSON file persistence (PoC-grade; phase 2 = SQLite/Postgres)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');

export class Store {
  constructor(name) {
    mkdirSync(DATA_DIR, { recursive: true });
    this.file = path.join(DATA_DIR, `${name}.json`);
    this.data = existsSync(this.file) ? JSON.parse(readFileSync(this.file, 'utf8')) : null;
    if (this.data === null) { this.data = {}; this.flush(); }
  }
  flush() { writeFileSync(this.file, JSON.stringify(this.data, null, 2)); }
  get(k, dflt) { return this.data[k] ?? dflt; }
  set(k, v) { this.data[k] = v; this.flush(); return v; }
}
