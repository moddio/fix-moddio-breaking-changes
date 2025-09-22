import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function extractJSDocs(code: string) {
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  return code.match(jsdocRegex) || [];
}

function trimMultilineString(multilineString: string) {
  return multilineString
    .split('\n')
    .map(line => line.trimStart())
    .join('\n');
}

function findAllFilesRecursive(startDir: string, predicate: (p: string) => boolean): string[] {
  const results: string[] = [];
  const entries = readdirSync(startDir);
  for (const entry of entries) {
    const full = path.join(startDir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...findAllFilesRecursive(full, predicate));
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

function generateDtsViaTsc(inputFile: string, outDir: string): string {
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const tscArgs = [
    inputFile,
    '--allowJs',
    '--declaration',
    '--emitDeclarationOnly',
    '--rootDir',
    path.dirname(inputFile),
    '--outDir',
    outDir,
  ];

  // On Windows the executable is npx.cmd
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const res = spawnSync(npxCmd, ['-y', 'tsc', ...tscArgs], { encoding: 'utf-8' });
  if (res.status !== 0) {
    const details = [res.stdout, res.stderr, res.error?.message]
      .filter(Boolean)
      .join('\n');
    throw new Error(`tsc failed for ${inputFile}:\n${details}`);
  }

  const emitted = findAllFilesRecursive(outDir, p => p.endsWith('.d.ts'));
  if (emitted.length === 0) {
    throw new Error(`No .d.ts emitted under ${outDir}`);
  }
  if (emitted.length > 1) {
    // Compile invoked for a single file, but just in case pick the matching basename
    const base = path.parse(inputFile).name + '.d.ts';
    const match = emitted.find(p => path.parse(p).base === base) || emitted[0];
    return match;
  }
  return emitted[0];
}

function buildOutputFrom(inputCode: string, dtsCode: string): string {
  // Determine namespace identifier (e.g., param, action) from .d.ts or input source
  const nsFromDts = /(declare\s+namespace|namespace)\s+([A-Za-z_$][\w$]*)/.exec(dtsCode)?.[2];
  const nsFromInput = /\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*\{/.exec(inputCode)?.[1];
  const namespaceIdent = nsFromDts || nsFromInput || 'param';
  // 1) Index all JSDoc blocks with their end positions.
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  type JsDocIndexed = { start: number; end: number; doc: string };
  const jsdocsIndexed: JsDocIndexed[] = [];
  let mDoc: RegExpExecArray | null;
  while ((mDoc = jsdocRegex.exec(inputCode)) !== null) {
    jsdocsIndexed.push({ start: mDoc.index, end: mDoc.index + mDoc[0].length, doc: mDoc[0] });
  }

  // 2) Find definitions in the namespace object literal and assignments to the global namespace that define functions.
  //    Support dot and bracket notation, function and arrow function forms.
  const escNs = namespaceIdent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const assignRegexes = [
    new RegExp(`\\b${escNs}\\.([A-Za-z_$][\\w$]*)\\s*=\\s*(?:async\\s+function\\s*\\(|function\\s*\\(|async\\s*\\(|\\()`, 'g'),
    new RegExp(`\\b${escNs}\\[(?:'|")([A-Za-z_$][\\w$]*)(?:'|")\\]\\s*=\\s*(?:async\\s+function\\s*\\(|function\\s*\\(|async\\s*\\(|\\()`, 'g'),
  ];

  type DefIndexed = { name: string; index: number };
  const defs: DefIndexed[] = [];
  for (const re of assignRegexes) {
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(inputCode)) !== null) {
      const name = mm[1];
      if (name && !name.startsWith('_')) {
        defs.push({ name, index: mm.index });
      }
    }
  }
  // Also parse the object literal: var|let|const param = { ... } capturing property functions
  const declMatch = new RegExp(`\\b(?:var|let|const)\\s+${escNs}\\s*=\\s*\\{`).exec(inputCode);
  if (declMatch) {
    const bodyStart = declMatch.index + declMatch[0].length; // right after '{'
    // Find matching '}' by simple brace counting
    let depth = 1;
    let i = bodyStart;
    while (i < inputCode.length && depth > 0) {
      const ch = inputCode[i++];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    const bodyEnd = i - 1; // position of matching '}'
    if (depth === 0 && bodyEnd > bodyStart) {
      const body = inputCode.slice(bodyStart, bodyEnd);
      const propFuncRegex = /(?:^|\n)\s*(?:['"]?)([A-Za-z_$][\w$]*)(?:['"]?)\s*:\s*(?:async\s*)?(?:function\s*\(|\([^)]*\)\s*=>)/g;
      let pm: RegExpExecArray | null;
      while ((pm = propFuncRegex.exec(body)) !== null) {
        const name = pm[1];
        if (name && !name.startsWith('_')) {
          // index in whole file
          const absIndex = bodyStart + pm.index;
          defs.push({ name, index: absIndex });
        }
      }
      // Keep defs sorted
      defs.sort((a, b) => a.index - b.index);
    }
  }
  // Sort by position to preserve source order
  defs.sort((a, b) => a.index - b.index);

  // 3) Pair each definition with the nearest preceding JSDoc block.
  type DocPair = { name: string; doc: string };
  const pairs: DocPair[] = [];
  let docCursor = 0;
  for (const def of defs) {
    // advance docCursor to the last jsdoc whose end <= def.index
    while (docCursor + 1 < jsdocsIndexed.length && jsdocsIndexed[docCursor + 1].end <= def.index) {
      docCursor++;
    }
    const candidate = jsdocsIndexed[docCursor];
    if (candidate && candidate.end <= def.index) {
      pairs.push({ name: def.name, doc: candidate.doc });
      // move past this doc to avoid reusing for distant defs
      docCursor++;
    }
  }

  // 4) Build a map of function name -> declaration from the .d.ts output
  // Accept optional "declare" prefix and capture through the terminating semicolon.
  const dtsFuncRegex = /(?:^|\n)\s*(?:declare\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([\s\S]*?;(?=\s*(?:\n|$))/g;
  const nameToDecl = new Map<string, string>();
  let m: RegExpExecArray | null;
  while ((m = dtsFuncRegex.exec(dtsCode)) !== null) {
    const name = m[1];
    if (name.startsWith('_')) continue;
    const fullDecl = dtsCode.slice(m.index).match(/^(?:\s*(?:declare\s+)?function[\s\S]*?;)/)![0];
    nameToDecl.set(name, fullDecl.trim());
  }

  // 5) Emit docs + matched declaration in the discovered order. Skip if no matching decl.
  let out = '';
  for (const { name, doc } of pairs) {
    const decl = nameToDecl.get(name);
    if (!decl) continue;
    out += trimMultilineString(doc) + '\n' + decl + '\n';
  }
  return out;
}

(function main() {
  const args = process.argv.slice(2);
  const fileFlagIdx = Math.max(args.indexOf('--file'), args.indexOf('-f'));

  const outDir = path.resolve(process.cwd(), path.join('tsdocs', 'output'));
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const inputFiles: string[] = [];
  if (fileFlagIdx !== -1 && args[fileFlagIdx + 1]) {
    inputFiles.push(path.resolve(process.cwd(), args[fileFlagIdx + 1]));
  } else {
    const inputRoot = path.resolve(process.cwd(), path.join('tsdocs', 'input'));
    inputFiles.push(
      ...findAllFilesRecursive(inputRoot, (p) => p.endsWith('.js'))
    );
  }

  for (const resolvedInput of inputFiles) {
    const tmpOutDir = path.resolve(process.cwd(), path.join('tsdocs', '.tmp_dts'));
    try {
      const emittedDtsPath = generateDtsViaTsc(resolvedInput, tmpOutDir);
      const inputCode = readFileSync(resolvedInput, 'utf-8');
      const dtsCode = readFileSync(emittedDtsPath, 'utf-8');

      let output = buildOutputFrom(inputCode, dtsCode);
      // Escape $ and ` prior to saving
      output = output.replace(/\$/g, '\\\$').replace(/`/g, '\\`');

      const base = path.parse(resolvedInput).name + '.d.ts';
      const outPath = path.join(outDir, base);
      writeFileSync(outPath, output, 'utf-8');
      // eslint-disable-next-line no-console
      console.log(`Wrote ${outPath}`);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(`Failed to generate for ${resolvedInput}: ${err?.message || err}`);
    } finally {
      try {
        rmSync(tmpOutDir, { recursive: true, force: true });
      } catch {}
    }
  }
})();