import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function verifyDeployedJson({
  deployedPath,
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
  for (const [label, document] of Object.entries(documents)) {
    validateDocument(document);
    if (document.quotes.length !== expectedQuoteCount) {
      throw new Error(`${label}: se esperaban ${expectedQuoteCount} frases y hay ${document.quotes.length}`);
    }
    const hash = hashes[`${label}_sha256`];
    if (hash !== expectedSha) {
      throw new Error(`${label}: hash inesperado ${hash}`);
    }
  }
  return {
    content_type: servedResponse.headers.get('content-type'),
    expected_quote_count: expectedQuoteCount,
    expected_sha256: expectedSha,
    ...hashes,
  };
}

export { sha256, verifyDeployedJson };
