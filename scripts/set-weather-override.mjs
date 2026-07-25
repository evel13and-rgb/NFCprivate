#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_OVERRIDE = resolve(SCRIPT_DIR, '../server/weather-override.json');
const PRODUCTION_OVERRIDE = '/etc/paramoliterario/weather-override.json';

const PRESETS = Object.freeze({
  dawn: { weather: 'cloudy', intensity: 'soft', timeOfDay: 'dawn' },
  sunny: { weather: 'sunny', intensity: 'strong', timeOfDay: 'day' },
  rainbow: { weather: 'rainbow', intensity: 'soft', timeOfDay: 'day' },
  mist: { weather: 'mist', intensity: 'soft', timeOfDay: 'day' },
  clear: { weather: 'clear', intensity: 'strong', timeOfDay: 'day' },
  cloudy: { weather: 'cloudy', intensity: 'soft', timeOfDay: 'day' },
  'light-rain': { weather: 'light-rain', intensity: 'soft', timeOfDay: 'day' },
  'heavy-rain': { weather: 'heavy-rain', intensity: 'strong', timeOfDay: 'day' },
});
const DISPLAYED_PRESETS = Object.freeze([
  'sunny',
  'rainbow',
  'mist',
  'clear',
  'cloudy',
  'light-rain',
  'heavy-rain',
  'off',
]);
const VALID_PRESET_NAMES = [...Object.keys(PRESETS), 'off'];
const VALID_WEATHER = new Set(Object.values(PRESETS).map(({ weather }) => weather));
const VALID_INTENSITIES = new Set(['soft', 'medium', 'strong']);
const VALID_TIMES_OF_DAY = new Set(['dawn', 'day', 'sunset', 'night']);

export function getHelpText() {
  return [
    'Uso: node scripts/set-weather-override.mjs <preset|off> [--production|--file RUTA]',
    '',
    'Presets disponibles:',
    ...DISPLAYED_PRESETS.map((preset) => `  ${preset}`),
    '  dawn          (amanecer; preset adicional)',
    '',
    'Prueba local o temporal:',
    '  node scripts/set-weather-override.mjs sunny',
    '  node scripts/set-weather-override.mjs rainbow --file /tmp/weather-override.json',
    `  Sin opciones escribe solo en ${REPOSITORY_OVERRIDE}`,
    '',
    'Preparar producción:',
    '  node scripts/set-weather-override.mjs sunny --production',
    `  El override real de producción es ${PRODUCTION_OVERRIDE}`,
    '  El script prepara el JSON y muestra los comandos sudo; no escribe directamente en /etc.',
    '',
    'Desactivar el override:',
    '  node scripts/set-weather-override.mjs off',
    '  node scripts/set-weather-override.mjs off --production',
    '',
    'ADVERTENCIA: desactiva el override al terminar para no dejar un clima de prueba activo.',
  ].join('\n');
}

export function buildOverride(preset, current = {}) {
  if (preset === 'off') {
    return {
      manualOverride: false,
      weather: VALID_WEATHER.has(current.weather) ? current.weather : 'cloudy',
      intensity: VALID_INTENSITIES.has(current.intensity) ? current.intensity : 'soft',
      timeOfDay: VALID_TIMES_OF_DAY.has(current.timeOfDay) ? current.timeOfDay : 'day',
    };
  }

  const fields = PRESETS[preset];
  if (!fields) {
    throw new Error(
      [
        `Preset desconocido: ${preset}`,
        `Presets válidos: ${VALID_PRESET_NAMES.join(', ')}`,
        'Usa --help para ver ejemplos y opciones.',
      ].join('\n'),
    );
  }
  return { manualOverride: true, ...fields };
}

async function readCurrent(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT' || error instanceof SyntaxError) return {};
    throw error;
  }
}

async function writeAtomic(filePath, payload) {
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o640,
  });
  await rename(temporaryPath, filePath);
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

async function stageProductionPayload(payload) {
  const stagedPath = `/tmp/paramo-weather-override-${process.getuid?.() ?? 'user'}.json`;
  await writeFile(stagedPath, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  return stagedPath;
}

export function parseArguments(args) {
  const [preset, ...options] = args;
  if (['--help', '-h'].includes(preset)) {
    return { help: true };
  }
  if (!preset) throw new Error(getHelpText());

  let filePath = REPOSITORY_OVERRIDE;
  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    if (option === '--production') {
      filePath = PRODUCTION_OVERRIDE;
    } else if (option === '--file' && options[index + 1]) {
      filePath = resolve(options[index + 1]);
      index += 1;
    } else {
      throw new Error(`Opción desconocida: ${option}\n\n${getHelpText()}`);
    }
  }
  return { help: false, preset, filePath };
}

async function main() {
  const parsedArguments = parseArguments(process.argv.slice(2));
  if (parsedArguments.help) {
    console.log(getHelpText());
    return;
  }

  const { preset, filePath } = parsedArguments;
  const payload = buildOverride(preset, await readCurrent(filePath));

  if (filePath === PRODUCTION_OVERRIDE) {
    const stagedPath = await stageProductionPayload(payload);
    console.log('Por seguridad, el script nunca escribe directamente en /etc.');
    console.log(`JSON preparado en ${stagedPath}. Revisa su contenido:`);
    console.log(`cat ${shellQuote(stagedPath)}`);
    console.log('Después, si es correcto, aplica manualmente:');
    console.log('sudo install -d -o root -g paramoliterario -m 0750 /etc/paramoliterario');
    console.log(
      `sudo install -o root -g paramoliterario -m 0640 ${shellQuote(stagedPath)} ${shellQuote(PRODUCTION_OVERRIDE)}`,
    );
    return;
  }

  try {
    await writeAtomic(filePath, payload);
    console.log(`Override ${preset === 'off' ? 'desactivado' : 'activado'} en ${filePath}`);
  } catch (error) {
    if (!['EACCES', 'EPERM', 'EROFS'].includes(error?.code)) {
      throw error;
    }
    console.error(`Sin permisos para escribir ${filePath}. No se ha cambiado el archivo.`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
