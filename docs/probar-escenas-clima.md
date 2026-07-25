# Probar escenas de clima con override

## Qué archivo utiliza cada entorno

El backend resuelve el override así:

1. Usa `PARAMO_WEATHER_OVERRIDE_FILE` cuando la variable está definida.
2. En su ausencia usa `server/weather-override.json`, junto al código.

En producción, `/etc/systemd/system/paramo-weather.service` carga
`/etc/paramoliterario/weather.env`. La configuración real comprobada es:

```text
PARAMO_WEATHER_OVERRIDE_FILE=/etc/paramoliterario/weather-override.json
```

Por tanto, el archivo real de producción es:

```text
/etc/paramoliterario/weather-override.json
```

`server/weather-override.json` sirve para desarrollo local y está protegido por los
filtros del despliegue: no reemplaza el archivo de producción.

La revisión encontró actualmente `/etc/paramoliterario` con grupo `nogroup` y modo
`0750`, y el JSON con grupo `nogroup` y modo `0640`. La unidad se ejecuta como
`paramoliterario:paramoliterario`; conviene corregir ese grupo antes de depender del
override. El script muestra los comandos `install` adecuados, pero nunca los ejecuta.

## Uso local seguro

Desde la raíz del repositorio:

```bash
node scripts/set-weather-override.mjs sunny
node scripts/set-weather-override.mjs rainbow
node scripts/set-weather-override.mjs dawn
node scripts/set-weather-override.mjs mist
node scripts/set-weather-override.mjs clear
node scripts/set-weather-override.mjs light-rain
node scripts/set-weather-override.mjs heavy-rain
node scripts/set-weather-override.mjs off
```

Sin opciones, el script solo modifica `server/weather-override.json`. Los presets son:

| Escena | `weather` | `intensity` | `timeOfDay` |
| --- | --- | --- | --- |
| Amanecer | `cloudy` | `soft` | `dawn` |
| Día soleado | `sunny` | `strong` | `day` |
| Arcoíris tras lluvia | `rainbow` | `soft` | `day` |
| Lluvia ligera | `light-rain` | `soft` | `day` |
| Lluvia fuerte | `heavy-rain` | `strong` | `day` |
| Niebla | `mist` | `soft` | `day` |
| Despejado | `clear` | `strong` | `day` |

Para una prueba completamente aislada se puede seleccionar una copia temporal:

```bash
node scripts/set-weather-override.mjs rainbow --file /tmp/paramo-weather-override-test.json

PARAMO_WEATHER_PORT=3031 \
PARAMO_WEATHER_HOST=127.0.0.1 \
PARAMO_WEATHER_STATE_FILE=/tmp/paramo-weather-state-test.json \
PARAMO_WEATHER_OVERRIDE_FILE=/tmp/paramo-weather-override-test.json \
node server/index.js
```

## Producción: preparación explícita

Seleccionar producción siempre requiere `--production`:

```bash
node scripts/set-weather-override.mjs sunny --production
node scripts/set-weather-override.mjs rainbow --production
node scripts/set-weather-override.mjs dawn --production
node scripts/set-weather-override.mjs mist --production
node scripts/set-weather-override.mjs light-rain --production
node scripts/set-weather-override.mjs heavy-rain --production
```

El script no usa `sudo` y, incluso si se ejecuta como root, nunca escribe directamente
en `/etc`: prepara un JSON en `/tmp`, muestra cómo revisarlo y ofrece los comandos
`sudo install` exactos. Ejecutarlos es una decisión manual. No hace falta reiniciar el
servicio; el backend lee el override en cada petición.

Comprueba el resultado:

```bash
curl --fail --silent --show-error http://127.0.0.1:3030/api/weather-state
```

## Desactivar y volver al comportamiento normal

Local:

```bash
node scripts/set-weather-override.mjs off
```

Producción:

```bash
node scripts/set-weather-override.mjs off --production
```

La desactivación escribe `"manualOverride": false`. El estado persistido puede seguir
sirviéndose hasta que venza su TTL (una hora por defecto); después el backend vuelve al
fallback del proveedor, actualmente `cloudy` con la franja horaria calculada, sin llamar
a ningún servicio meteorológico externo.

## Alcance actual de `timeOfDay`

El backend acepta y devuelve `dawn`, `day`, `sunset` y `night`. El cliente actual usa
el `timeOfDay` válido recibido al aplicar el estado, así que `dawn` puede comprobarse
al cargar la página. Sin embargo, el temporizador del cliente recalcula después la
franja con la hora local del navegador. Por eso este override no bloquea profundamente
la hora: para una prueba estable, recarga la página y verifica la escena antes de la
siguiente actualización periódica. No se ha cambiado esa arquitectura en esta tarea.
