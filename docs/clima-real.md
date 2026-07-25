# Clima real con Open-Meteo

## Proveedor y comportamiento seguro

El backend consulta la API Forecast de [Open-Meteo](https://open-meteo.com/en/docs).
No necesita clave. Solicita condiciones actuales, previsión horaria, amanecer,
puesta de sol y precipitación diaria para dos días. También pide tres horas previas
de previsión horaria para que la heurística de arcoíris tenga contexto cercano.

Si faltan coordenadas, `fetch` no está disponible, la red falla o Open-Meteo responde
con error, `/api/weather-state` continúa respondiendo con `cloudy`, intensidad `soft`
y `source: "fallback"`. El servidor registra una advertencia clara.

## Configuración

El archivo de entorno de producción es:

```text
/etc/paramoliterario/weather.env
```

Debe conservar las variables existentes y añadir coordenadas WGS84:

```ini
PARAMO_WEATHER_PROVIDER=open-meteo
PARAMO_WEATHER_LATITUDE=<latitud>
PARAMO_WEATHER_LONGITUDE=<longitud>
PARAMO_WEATHER_TIMEZONE=auto
PARAMO_WEATHER_TTL_MINUTES=30
```

`PARAMO_WEATHER_TIMEZONE` es opcional; sin ella se usa `auto`. El TTL válido está
limitado a 5–180 minutos y por defecto es 30. La ubicación no está fijada en el código:
hay que elegir explícitamente las coordenadas que represente Páramo Literario.

En la revisión del 25 de julio de 2026, el entorno instalado todavía no contenía
`PARAMO_WEATHER_LATITUDE`, `PARAMO_WEATHER_LONGITUDE` ni las demás variables nuevas.
Hasta configurarlas y publicar el backend, producción seguirá usando el comportamiento
anterior.

Después de editar el entorno de forma deliberada:

```bash
sudo systemctl restart paramo-weather.service
systemctl status paramo-weather.service --no-pager -l
curl --fail --silent --show-error http://127.0.0.1:3030/api/weather-state
```

El proceso usa `fetch` nativo de Node y un timeout de ocho segundos. No se instala
ninguna dependencia.

## Contrato de `/api/weather-state`

La respuesta incluye:

- `weather`, `intensity`, `timeOfDay` y `visualScene`;
- `source` (`open-meteo`, `fallback` o `manual-override`);
- `provider`;
- `updatedAt`, `expiresAt` y `schemaVersion`;
- `diagnostics` básicos: código WMO, nubosidad, precipitación, probabilidad cercana,
  zona horaria y disponibilidad de datos solares. No contiene coordenadas.

Los estados cacheados usan una versión de esquema. Los JSON antiguos —incluidos
estados manuales antiguos como `rainbow`— se invalidan automáticamente. Cuando se
apaga un override moderno, la caché con `source: "manual-override"` se ignora de
inmediato y se vuelve al proveedor, sin esperar al TTL.

## Decisiones visuales

### Tiempo meteorológico e intensidad

- WMO 0 produce `sunny` durante luz diurna y `clear` de noche.
- WMO 1–2 produce `cloudy`; una cobertura igual o superior al 88 % produce `overcast`.
- WMO 3 produce `overcast`.
- WMO 45/48 produce `mist`.
- Llovizna, lluvia o chubascos moderados producen `light-rain`.
- Códigos fuertes, tormenta, granizo o una tasa alta producen `heavy-rain`.
- La nieve moderada se representa como `overcast`; nieve fuerte, como `heavy-rain`,
  porque la web no incorpora un efecto específico de nieve.
- Precipitación, tasa de lluvia/chubascos y probabilidad horaria cercana ajustan
  `soft`, `medium` o `strong`.

### Amanecer y puesta de sol

Con datos solares válidos:

- `dawn`: desde `sunrise` hasta 90 minutos después;
- `sunset`: desde 90 minutos antes de `sunset` hasta 30 minutos después;
- `night`: antes del amanecer y después del margen de puesta;
- `day`: el resto.

Si faltan esos datos se conserva el horario anterior: noche 20:00–05:59, amanecer
06:00–07:29, día 07:30–17:59 y atardecer 18:00–19:59.

### Arcoíris

`rainbow` solo se activa si:

- no es de noche;
- el código actual es despejado o parcialmente nuboso, con nubosidad inferior al 75 %;
- no hay lluvia activa apreciable;
- en una ventana de ±3 horas existe precipitación prevista/reciente de al menos
  0,1 mm o una probabilidad de precipitación de al menos 60 %.

Sin evidencia suficiente se conserva `sunny`, `clear` o `cloudy`.

## Refresco y fallback

El cliente respeta `timeOfDay` y `visualScene` cuando `source` es `open-meteo`. Programa
la siguiente consulta según `expiresAt`, con límites de 5 a 60 minutos. Ante un fallo
conserva el último estado real y reintenta sin polling agresivo. Cuando el servidor
está en fallback, el cliente conserva su cálculo horario local.

Para volver deliberadamente al fallback, elimina o comenta las coordenadas y reinicia
el servicio. La respuesta indicará `source: "fallback"` y
`diagnostics.reason: "missing-coordinates"`.

El override manual se conserva exclusivamente para emergencia y desarrollo. No forma
parte del funcionamiento normal y debe permanecer con `"manualOverride": false`.
