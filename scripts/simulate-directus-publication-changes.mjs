#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPublicDocument,
  comparisonReport,
  validatePublicDocument,
} from './export-directus-quotes-preview.mjs';
import {
  contentChangeDecision,
  ensureCandidateOutputPath,
  selectPublicationRecords,
  summarizeIssues,
} from './prepare-directus-quotes-publication.mjs';

const DEFAULT_OUTPUT_PATH = '/tmp/paramo-directus-publication-change-scenarios.json';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const publicQuotesPath = path.join(projectRoot, 'public', 'data', 'quotes.json');

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function parseArguments(argv) {
  let outputPath = DEFAULT_OUTPUT_PATH;
  let help = false;
  for (const argument of argv) {
    if (argument === '--help') help = true;
    else if (argument.startsWith('--output=')) outputPath = argument.slice('--output='.length);
    else throw new Error(`Argumento no reconocido: ${argument}`);
  }
  return { help, outputPath: ensureCandidateOutputPath(outputPath) };
}

function databaseSnapshotFromPublic(publicDocument) {
  const reviewedAt = '2026-08-24T00:00:00.000Z';
  const quotes = publicDocument.quotes.map((quote) => ({
    id: quote.id,
    legacy_index: quote.legacy_index,
    text: quote.t,
    highlight: quote.highlight,
    language: quote.lang,
    quote_type: quote.type,
    author_id: quote.authorId,
    work_id: quote.workId,
    speaker_display_name: quote.a,
    legacy_attribution: quote.a,
    legacy_work: quote.obra,
    text_hash: sha256(quote.t),
    publication_excluded: false,
    workflow_status: 'approved',
    visibility: 'public',
    verification_status: 'verified',
    reviewer_id: 'simulation-reviewer',
    reviewed_at: reviewedAt,
    publish_at: null,
  }));
  const originals = publicDocument.quotes
    .filter((quote) => quote.original)
    .map((quote) => ({
      id: `simulation-original-${quote.id}`,
      import_key: `simulation-original-${quote.id}`,
      quote_id: quote.id,
      original_text: quote.original.text,
      language: quote.original.lang,
      label: quote.original.label,
      is_primary: true,
      workflow_status: 'approved',
      visibility: 'public',
      verification_status: 'verified',
      reviewer_id: 'simulation-reviewer',
      reviewed_at: reviewedAt,
    }));
  return { originals, quotes };
}

function newScenarioRecords(snapshot) {
  const templateQuote = snapshot.quotes[0];
  const templateOriginal = snapshot.originals.find((original) => (
    original.quote_id === templateQuote.id
  ));
  const quote = {
    ...templateQuote,
    id: 'quote-scenario-new',
    legacy_index: Math.max(...snapshot.quotes.map((record) => record.legacy_index)) + 1,
    text: 'Fragmento nuevo simulado para comprobar el control editorial.',
    text_hash: sha256('Fragmento nuevo simulado para comprobar el control editorial.'),
  };
  const original = templateOriginal ? {
    ...templateOriginal,
    id: 'simulation-original-quote-scenario-new',
    import_key: 'simulation-original-quote-scenario-new',
    quote_id: quote.id,
    original_text: 'Simulated original fragment for publication control.',
  } : null;
  return { original, quote };
}

function evaluateScenario(name, snapshot, publicDocument) {
  const selection = selectPublicationRecords(snapshot);
  if (selection.issues.length) {
    return {
      name,
      selection_issues: summarizeIssues(selection.issues),
      comparison: null,
      without_explicit_authorization: null,
      with_explicit_authorization: null,
    };
  }
  const candidate = buildPublicDocument({
    quotes: selection.quotes,
    originals: selection.originals,
    generatedAt: publicDocument.generated_at,
  });
  const comparison = comparisonReport(candidate, publicDocument);
  return {
    name,
    selected_quotes: selection.quotes.length,
    selected_originals: selection.originals.length,
    comparison,
    without_explicit_authorization: contentChangeDecision(comparison, false),
    with_explicit_authorization: contentChangeDecision(comparison, true),
  };
}

function buildScenarioReport(publicDocument) {
  validatePublicDocument(publicDocument);
  const baseline = databaseSnapshotFromPublic(publicDocument);
  if (!baseline.quotes.length) throw new Error('El catálogo público está vacío');
  const firstQuoteId = baseline.quotes[0].id;
  const added = newScenarioRecords(baseline);
  const scenarios = [];

  scenarios.push(evaluateScenario('baseline_sin_cambios', structuredClone(baseline), publicDocument));

  const draftAddition = structuredClone(baseline);
  draftAddition.quotes.push({ ...added.quote, workflow_status: 'draft', visibility: 'hidden' });
  if (added.original) {
    draftAddition.originals.push({
      ...added.original,
      workflow_status: 'in_review',
      visibility: 'hidden',
    });
  }
  scenarios.push(evaluateScenario('alta_en_borrador', draftAddition, publicDocument));

  const approvedAddition = structuredClone(baseline);
  approvedAddition.quotes.push(added.quote);
  if (added.original) approvedAddition.originals.push(added.original);
  scenarios.push(evaluateScenario('alta_aprobada', approvedAddition, publicDocument));

  const textModification = structuredClone(baseline);
  textModification.quotes[0].text += ' [cambio simulado]';
  textModification.quotes[0].text_hash = sha256(textModification.quotes[0].text);
  scenarios.push(evaluateScenario('modificacion_traduccion', textModification, publicDocument));

  if (baseline.originals.length) {
    const originalModification = structuredClone(baseline);
    originalModification.originals[0].original_text += ' [simulated change]';
    scenarios.push(evaluateScenario('modificacion_original', originalModification, publicDocument));
  }

  const exclusion = structuredClone(baseline);
  exclusion.quotes[0].publication_excluded = true;
  scenarios.push(evaluateScenario('exclusion_editorial', exclusion, publicDocument));

  const archival = structuredClone(baseline);
  archival.quotes[0].workflow_status = 'archived';
  scenarios.push(evaluateScenario('baja_archivada', archival, publicDocument));

  const expected = {
    baseline_sin_cambios: { exact: true },
    alta_en_borrador: { exact: true },
    alta_aprobada: { exact: false, newId: added.quote.id },
    modificacion_traduccion: { exact: false, changedId: firstQuoteId },
    modificacion_original: { exact: false, changedId: firstQuoteId },
    exclusion_editorial: { exact: false, missingId: firstQuoteId },
    baja_archivada: { exact: false, missingId: firstQuoteId },
  };
  for (const scenario of scenarios) {
    if (scenario.selection_issues) {
      throw new Error(`${scenario.name}: la simulación produjo bloqueos inesperados`);
    }
    const rule = expected[scenario.name];
    if (scenario.comparison.exact !== rule.exact) {
      throw new Error(`${scenario.name}: resultado exact inesperado`);
    }
    if (rule.newId && !scenario.comparison.new_in_preview.includes(rule.newId)) {
      throw new Error(`${scenario.name}: no se detectó el alta`);
    }
    if (rule.changedId && !scenario.comparison.changed.includes(rule.changedId)) {
      throw new Error(`${scenario.name}: no se detectó la modificación`);
    }
    if (rule.missingId && !scenario.comparison.missing_from_preview.includes(rule.missingId)) {
      throw new Error(`${scenario.name}: no se detectó la retirada`);
    }
    if (!rule.exact && scenario.without_explicit_authorization.allowed) {
      throw new Error(`${scenario.name}: el cambio se permitiría sin autorización`);
    }
    if (!scenario.with_explicit_authorization.allowed) {
      throw new Error(`${scenario.name}: la autorización explícita no habilita la vista previa`);
    }
  }

  return {
    generated_at: new Date().toISOString(),
    source: 'public/data/quotes.json',
    writes_directus: false,
    writes_postgresql: false,
    writes_public_files: false,
    deploys_web: false,
    baseline_quote_count: publicDocument.quotes.length,
    scenarios,
  };
}

async function main() {
  const { help, outputPath } = parseArguments(process.argv.slice(2));
  if (help) {
    process.stdout.write('Uso: node scripts/simulate-directus-publication-changes.mjs [--output=/tmp/informe.json]\n');
    process.stdout.write('Solo simula cambios en memoria y escribe el informe bajo /tmp.\n');
    return;
  }
  const publicDocument = JSON.parse(await readFile(publicQuotesPath, 'utf8'));
  const report = buildScenarioReport(publicDocument);
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({
    output: outputPath,
    scenarios_passed: report.scenarios.length,
    baseline_quote_count: report.baseline_quote_count,
    writes_directus: false,
    writes_postgresql: false,
    writes_public_files: false,
    deploys_web: false,
  }, null, 2)}\n`);
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export {
  buildScenarioReport,
  databaseSnapshotFromPublic,
  evaluateScenario,
  parseArguments,
};
