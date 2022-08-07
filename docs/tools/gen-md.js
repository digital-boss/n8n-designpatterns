#!/usr/bin/env node

/**
 * Generate markdown from step*__step*.json fies.
 */

const fs = require ('node:fs');

const readJson = (file) => {
  const s = fs.readFileSync(file);
  return JSON.parse(s);
}

const findPrevFileIndexes = (versions, verIdx, fileIdx) => {
  const v = versions[verIdx];
  const f = v.files[fileIdx];

  let i = verIdx-1;
  while (i >= 0) {
    const prevFileIdx = versions[i].files.findIndex(j => j.filename === f.filename)
    if (prevFileIdx !== -1) {
      return [i, prevFileIdx]
    }
    i--;
  }
  return undefined;
}

const getPrevFile = (versions, verIdx, fileIdx) => {
  const idx = findPrevFileIndexes(versions, verIdx, fileIdx);
  if (idx) {
    return getFileProps(versions, idx[0], idx[1]);
  }
  return undefined;
}

const getFileProps = (versions, verIdx, fileIdx) => {
  const v = versions[verIdx];
  const f = v.files[fileIdx];
  return { ...f };
}

const fileFilter = (f) => {
  return !f.filename.endsWith('gen.js') && !f.filename.match(/\/generated\//);
}

// index

const file2md = (versions, verIdx, fileIdx) => {
  const v = versions[verIdx];
  const f = v.files[fileIdx];

  const p = getPrevFile(versions, verIdx, fileIdx);
  const prev = p ? ` [prev](${p.raw_url})` : '';
  return `[${f.filename}](${f.raw_url}) ${f.status} [${f.additions},${f.deletions},${f.changes}]${prev}`;
}

const files2md = (versions, verIdx) => {
  const v = versions[verIdx];
  return v.files.map((f, i) => {
    if (fileFilter(f)) {
      const text = file2md(versions, verIdx, i);
      return `- ${text}`;
    }
    return undefined;
  });
}

const ver2md = (versions, verIdx) => {
  const v = versions[verIdx];
  const caption = v.url.match(/\/[^/]+$/)[0].slice(1);
  const list = files2md(versions, verIdx).filter(f => f).join('\n');
  return `## ${caption} [compare](${v.url})\n\n${list}`;
}

// diffs

const file2diff = (versions, verIdx, fileIdx) => {
  const v = versions[verIdx];
  const f = v.files[fileIdx];
  const p = getPrevFile(versions, verIdx, fileIdx);
  const prev = p ? ` [prev](${p.raw_url})` : '';
  const links = [
    `[content](${f.contents_url})`,
    `[raw](${f.raw_url})`,
    `${f.status}`,
    `[${f.additions},${f.deletions},${f.changes}]`,
    prev,
  ].filter(x => x).join(' | ');
  
  return `## ${f.filename}\n\n${links}\n\n\`\`\`diff\n${f.patch}\n\`\`\``
}

const files2diffs = (versions, verIdx) => {
  const v = versions[verIdx];
  return v.files.map((f, i) => {
    if (fileFilter(f)) {
      return file2diff(versions, verIdx, i);
    }
    return undefined;
  });
}

const ver2diffs = (versions, verIdx) => {
  const v = versions[verIdx];
  const caption = v.url.match(/\/[^/]+$/)[0].slice(1);
  const list = files2diffs(versions, verIdx).filter(f => f).join('\n');
  return `## ${caption} [compare](${v.url})\n\n${list}`;
}

// main

const data = fs.readdirSync('.')
  .filter(f => f.match(/step.+__step.+\.json$/))
  .map(readJson);

const index = data
  .map((_, vi, versions) => ver2md(versions, vi))
  .join('\n\n');

data
  .map((v, vi, versions) => {
    const filename = v.url.match(/\/[^/]+$/)[0].slice(1).replace('...', '__') + '.md';
    return [filename, ver2diffs(versions, vi)];
  })
  .forEach(([filename, content]) => fs.writeFileSync(filename, content, 'utf-8'));

fs.writeFileSync('index.md', index, 'utf-8');

