// bootstrap.ts
import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'child_process';

// Preload .env for server files that import environment values at module scope
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// After loading env, require server file (so it uses loaded env vars)
require('./server'); // server.ts will run (compiled with tsx at dev)
