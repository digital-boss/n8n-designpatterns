import fs from 'node:fs';
import path from 'node:path';
import { ConditionFn, createMapFromTransformers, Transformers } from "./transform";
import { match, TraverseContext } from "./TraverseContext";
import { runInThisContext } from "node:vm";
import { traverse } from "./traverse";
import { createTypeMarker, TypeResolvers } from "./mark";

// Common Tools

const readJson = (file: string) => {
  const s = fs.readFileSync(file, 'utf-8');
  return JSON.parse(s);
}

// Interfaces

interface IFile {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

interface ICompareResult {
  url: string;
  html_url: string;
  permalink_url: string;
  diff_url: string;
  patch_url: string;
  files: IFile[];
}

// Tree traverser setup

type TypeName = 'Root'; // just one type for root node.

class Context extends TraverseContext<TypeName, ICompareResult[]> {
  
  getPrevFile (): IFile | undefined {
    if (!this.isMatch("files / *")) {
      return undefined;
    }
    const f = this.getValue() as IFile;
    let i = (this.path[0] as number) - 1;
    while (i >= 0) {
      const prevFileIdx = this.sourceObj[i].files.findIndex(j => j.filename === f.filename)
      if (prevFileIdx !== -1) {
        return this.sourceObj[i].files[prevFileIdx];
      }
      i--;
    }
    return undefined;
  } 
}

const typeResolvers: TypeResolvers<TypeName, ICompareResult[]> = [
  ['Root', (ctx, v) => ctx.path.length === 0]
]

const trIndex: Transformers<Context> = [
  [match("::Root / * / files / *"), (v, ctx) => {
    const p = ctx.getPrevFile();
    const prev = p ? ` [prev](${p.raw_url})` : '';
    return `- [${v.filename}](${v.raw_url}) ${v.status} [${v.additions},${v.deletions},${v.changes}]${prev}`;
  }],
  [match("::Root / * / files"), (v, ctx) => {
    return v.join('\n');
  }],
  [match("::Root / *"), (v, ctx) => {
    const caption = v.url.match(/\/[^/]+$/)[0].slice(1);
    const filename = caption.replace('...', '__') + '.md';
    return `## ${caption}\n\n[gh compare](${v.url}) | [go to details](${filename})\n\n${v.files}`;
  }],
  [match("::Root"), (v, ctx) => {
    return v.join('\n\n');
  }],
];

const trDiffs: Transformers<Context> = [
  [match("::Root / * / files / *"), (v, ctx) => {
    const p = ctx.getPrevFile();
    const prev = p ? ` [prev](${p.raw_url})` : '';
    const menu = `- [${v.filename}](${v.raw_url}) ${v.status} [${v.additions},${v.deletions},${v.changes}]${prev}`
    const content = `## ${v.filename}<a name="${v.filename}"></a>

${menu}

\`\`\`diff
${v.patch}
\`\`\`
`;
    return [v.filename, content];
  }],
  [match("::Root / * / files"), (v, ctx) => {
    const toc = v.map(([i, _]) => i).map(i => `- [${i}](#${i})`).join('\n');
    const content = v.map(([_, i]) => i).join('\n');
    return `${toc}\n\n${content}`
  }],
  [match("::Root / *"), (v, ctx) => {
    const caption = v.url.match(/\/[^/]+$/)[0].slice(1);
    const filename = caption.replace('...', '__') + '.md';
    const content = `# ${caption} [compare](${v.url})\n\n${v.files}`;
    return [filename, content];
  }],
];

// Main

const fileFilter = (f: IFile) => {
  return !f.filename.endsWith('gen.js') 
    && f.filename !== 'package-lock.json'
    && !f.filename.match(/\/generated\//);
}

const baseDir = 'docs/generated';

const data = fs.readdirSync(path.join(baseDir, 'json'))
  .filter(f => f.match(/step.+__step.+\.json$/))
  .map(f => path.join(baseDir, 'json', f))
  .map(readJson)
  .map(v => ({...v, files: v.files.filter(fileFilter)}));
// console.log(data);

const ctx = new Context(data);
traverse(createTypeMarker<TypeName, ICompareResult[]>(ctx, typeResolvers), data);

const index = traverse<ICompareResult[], string>(createMapFromTransformers(ctx, trIndex), data);
fs.writeFileSync(path.join(baseDir, 'index.md'), index, 'utf-8');

const diffs = traverse<ICompareResult[], Array<[string, string]>>(createMapFromTransformers(ctx, trDiffs), data);
diffs.forEach(([filename, content]) => {
  // console.log(filename);
  fs.writeFileSync(path.join(baseDir, filename), content, 'utf-8');
});
