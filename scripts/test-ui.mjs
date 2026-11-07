import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
mkdirSync('tmp/tests',{recursive:true});
await build({absWorkingDir:process.cwd(),entryPoints:[process.cwd()+'/tests/app.test.jsx'],tsconfigRaw:{},bundle:true,platform:'node',format:'esm',packages:'external',outfile:'tmp/tests/app.test.mjs',jsx:'automatic'});
const result=spawnSync(process.execPath,['--test','tmp/tests/app.test.mjs'],{stdio:'inherit'});
process.exitCode=result.status ?? 1;
