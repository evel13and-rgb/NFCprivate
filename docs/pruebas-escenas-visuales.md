# Pruebas locales de escenas visuales

El override manual existente permite probar estas escenas sin conectar un proveedor meteorológico.
Trabaja sobre una copia temporal para no modificar ni publicar el override real:

```bash
cp server/weather-override.json /tmp/paramo-weather-override-test.json
```

En la copia, conserva `"manualOverride": true` y usa una de estas combinaciones:

```json
{ "manualOverride": true, "weather": "rainbow", "intensity": "soft", "timeOfDay": "day" }
```

```json
{ "manualOverride": true, "weather": "sunny", "intensity": "soft", "timeOfDay": "day" }
```

```json
{ "manualOverride": true, "weather": "cloudy", "intensity": "soft", "timeOfDay": "dawn" }
```

Arranca un servidor de prueba aislado:

```bash
PARAMO_WEATHER_PORT=3031 \
PARAMO_WEATHER_HOST=127.0.0.1 \
PARAMO_WEATHER_STATE_FILE=/tmp/paramo-weather-state-test.json \
PARAMO_WEATHER_OVERRIDE_FILE=/tmp/paramo-weather-override-test.json \
node server/index.js
```

Las escenas resultantes son `rainbow-after-rain`, `sunny-day` y `dawn`. El campo
`timeOfDay` del estado servido se respeta, por lo que la prueba de amanecer no depende
de la hora del equipo.

La exportación de la imagen compartida mantiene su tratamiento actual orientado a
día/noche. Estas escenas no cambian ese código; queda pendiente ampliar el aspecto de
la imagen compartida si se desea reproducir todos los fondos nuevos.
