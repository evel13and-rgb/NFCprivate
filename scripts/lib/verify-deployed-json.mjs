import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function verifyDeployedJson({
  countDocument,
  deployedPath,
  expectedEntityCounts,
  expectedQuoteCount,
  expectedSha,
  fetchImpl = fetch,
  servedUrl,
  sourcePath,
  validateDocument,
}) {
  const [sourceText, deployedText, servedResponse] = await Promise.all([
    readFile(sourcePath, 'utf8'),
    readFile(deployedPath, 'utf8'),
    fetchImpl(servedUrl, {
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache' },
    }),
  ]);
  if (!servedResponse.ok) {
    throw new Error(`El recurso HTTPS respondió ${servedResponse.status}`);
  }
  const servedText = await servedResponse.text();
  const documents = {
    source: JSON.parse(sourceText),
    deployed: JSON.parse(deployedText),
    served: JSON.parse(servedText),
  };
  const hashes = {
    source_sha256: sha256(sourceText),
    deployed_sha256: sha256(deployedText),
    served_sha256: sha256(servedText),
  };
  const expectedCounts = expectedEntityCounts || { quotes: expectedQuoteCount };
  const collectCounts = countDocument || ((document) => ({ quotes: document.quotes.length }));
  const entityCounts = {};
  for (const [label, document] of Object.entries(documents)) {
    validateDocument(document);
    const actualCounts = collectCounts(document);
    entityCounts[label] = actualCounts;
    for (const [entity, expected] of Object.entries(expectedCounts)) {
      if (actualCounts[entity] !== expected) {
        throw new Error(`${label}: se esperaban ${expected} ${entity} y hay ${actualCounts[entity]}`);
      }
    }
    const hash = hashes[`${label}_sha256`];
    if (hash !== expectedSha) {
      throw new Error(`${label}: hash inesperado ${hash}`);
    }
  }
  return {
    content_type: servedResponse.headers.get('content-type'),
    ...(expectedQuoteCount === undefined ? {} : { expected_quote_count: expectedQuoteCount }),
    expected_entity_counts: expectedCounts,
    entity_counts: entityCounts,
    expected_sha256: expectedSha,
    ...hashes,
  };
}

export { sha256, verifyDeployedJson };
