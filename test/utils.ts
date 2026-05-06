import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { GetMetadataResponse, GetDeploymentGraphResponse, Range } from 'bicep-node';

export async function getUniqueTmpDir(prefix: string): Promise<string> {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function normalizeNewlines(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

function rangeLink(name: string, range: Range, fileName: string): string {
  const s = `L${range.start.line + 1}C${range.start.char + 1}`;
  const e = `L${range.end.line + 1}C${range.end.char + 1}`;
  return `[\`${name}\`](./${fileName}#${s}-${e})`;
}

export function formatMarkdown(
  metadata: GetMetadataResponse,
  graph: GetDeploymentGraphResponse,
  fileName: string
): string {
  const description = metadata.metadata.find(m => m.name === 'description')?.value ?? '';

  const nodeLines = graph.nodes
    .map(n => `    ${n.name}["${n.name}${n.isExisting ? ' (existing)' : ' '}\n    ${n.type}"]`)
    .join('\n');

  const edgeLines = graph.edges
    .map(e => `    ${e.source}-->${e.target};`)
    .join('\n');

  const paramRows = metadata.parameters
    .map(p => `| ${rangeLink(p.name, p.range, fileName)} | ${p.type ? `\`${p.type.name}\`` : ''} | ${p.description ?? ''} |`)
    .join('\n');

  const outputRows = metadata.outputs
    .map(o => `| ${rangeLink(o.name, o.range, fileName)} | ${o.type ? `\`${o.type.name}\`` : ''} | ${o.description ?? ''} |`)
    .join('\n');

  return [
    '',
    '## Description',
    '',
    description,
    '',
    '',
    '## Graph',
    '',
    '```mermaid',
    'flowchart LR;',
    nodeLines,
    '',
    edgeLines,
    '',
    '```',
    '',
    '',
    '## Parameters',
    '',
    '| Name | Type | Description |',
    '| -- | -- | -- |',
    paramRows,
    '',
    '',
    '',
    '## Outputs',
    '',
    '| Name | Type | Description |',
    '| -- | -- | -- |',
    outputRows,
    '',
    '',
    '',
  ].join('\n');
}
