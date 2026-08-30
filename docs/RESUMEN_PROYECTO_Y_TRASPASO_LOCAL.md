# Páramo Literario: resumen integral y guía de traspaso a local

- **Estado del documento:** versionado el 30 de agosto de 2026; traspaso local
  aparcado hasta nueva decisión.
- **Repositorio de trabajo en la VPS:** `/srv/paramoliterario/source`.
- **Rama principal:** `main`.
- **Finalidad:** ofrecer una vista completa y autocontenida del proyecto antes de
  trasladarlo a un entorno local y reorganizar el trabajo asistido por IA.

> Este documento no contiene contraseñas, tokens, coordenadas privadas ni
> secretos de infraestructura. No deben añadirse aquí en el futuro.

## 1. Qué es Páramo Literario

Páramo Literario es una experiencia web literaria y atmosférica que muestra
fragmentos de obras, su atribución y, cuando está disponible, el texto en su
idioma original. La presentación visual cambia según la hora local del visitante
y un estado meteorológico global obtenido por el servidor.

El proyecto combina:

- una web pública estática, construida con HTML, CSS y JavaScript nativo;
- un catálogo editorial de citas, autores, obras, originales y fuentes;
- una entrada especial mediante etiquetas NFC;
- un pequeño backend Node.js para el clima;
- una instalación privada de Directus y PostgreSQL para evolucionar la gestión
  editorial;
- generadores, validadores, pruebas y mecanismos de publicación y respaldo.

No utiliza React, Vue, Next.js ni otro framework de frontend. Tampoco necesita
un proceso de compilación para servir la interfaz actual.

## 2. Propósito del proyecto

### Propósito de producto

Crear un encuentro pausado con la literatura: cada visita presenta una frase en
un entorno visual vivo, con acceso progresivo a su autor, obra, texto original y
ficha literaria. La entrada NFC permite que una frase concreta pueda quedar
vinculada a un encuentro físico.

### Propósito editorial

Mantener un catálogo literario trazable en el que se puedan distinguir:

- el texto público en español;
- el original cotejado;
- el autor, la obra y, cuando procede, el personaje o hablante;
- las fuentes bibliográficas;
- el estado de revisión y los derechos;
- las decisiones humanas que corrigen o aprueban el contenido.

### Propósito técnico

Mantener la web pública rápida, económica y resistente. La base editorial privada
no se consulta en cada visita: Directus/PostgreSQL exporta de forma deliberada
artefactos JSON que Nginx sirve como archivos estáticos. Así la web puede seguir
funcionando aunque Directus esté detenido.

## 3. Estado actual resumido

- La web pública consume **640 citas** desde `public/data/quotes.json`.
- El catálogo público de perfiles contiene **23 autores** y **28 obras**.
- Los borradores editoriales versionados contienen 27 autores, 29 obras y 29
  fuentes; no todo borrador está destinado todavía a publicación.
- Hay 23 retratos de autores y 12 fondos atmosféricos en PNG/WebP.
- Existen 24 archivos de pruebas automatizadas con `node:test`.
- El piloto Directus/PostgreSQL tiene documentadas 18 colecciones, 231 campos y
  46 relaciones.
- Directus contiene 27 autores, 29 obras, 29 fuentes, 14 hablantes, 640 frases y
  640 originales; los temas y el audio siguen pendientes.
- La fase de exportación paralela está validada y queda en espera hasta incorporar
  nuevas obras o aprobar otro cambio editorial deliberado.
- Las copias cifradas externas en Backblaze B2 y su prueba semanal de restauración
  están activas.
- La fuente de verdad del código está en Git, rama `main`.
- La publicación en producción se realiza desde la VPS; un `git push` no
  despliega la web.

## 4. Arquitectura general

```text
                           ÁREA PRIVADA

 Editores ──> Directus ──> PostgreSQL
                    │
                    │ exportación validada y deliberada
                    ▼
        scripts/ + validadores + aprobación humana
                    │
                    ▼
       public/data/quotes.json
       public/data/literary-profiles.json
                    │
                    │ deploy-local.sh
                    ▼
                           ÁREA PÚBLICA

 Navegador ──> Nginx ──> HTML/CSS/JS + JSON + imágenes
                    │
                    └── /api/weather-state
                              │ proxy local
                              ▼
                    servicio Node del clima
                              │
                              ▼
                         Open-Meteo
```

Principio fundamental: **Directus no forma parte del camino crítico de una
visita pública**. Una edición en el CMS no se publica automáticamente.

## 5. Árbol de archivos comentado

```text
source/
├── .github/
│   └── workflows/deploy.yml       Comprobación manual; no despliega producción
├── .gitignore
├── package.json                   Proyecto ESM y comandos npm
├── deploy-local.sh                Comprobar, simular y publicar desde la VPS
│
├── index.html                     Documento principal y estructura de interfaz
├── style.css                      Diseño, animaciones y adaptación responsive
├── script.js                      Orquestador principal del frontend
├── logo.svg                       Identidad visual
├── ChatGPT Image ... .png         Recurso gráfico original conservado
│
├── quoteLogic.js                  Rotación, historial y selección de citas
├── publicQuotes.js                Carga y validación del JSON público; fallback
├── quoteOriginal.js               Presentación del texto en idioma original
├── nfcExperience.js               Lectura y creación de URLs del modo NFC
├── dayNight.js                    Cálculo de amanecer/día/atardecer/noche local
├── weatherVisual.js               Clima + hora → escena visual
├── sceneBackground.js             Selección y precarga de fondos
├── fireflies.js                   Sistema visual de luciérnagas
├── dayMotes.js                    Partículas luminosas diurnas
├── forestSound.js                 Paisaje sonoro y controles de audio
│
├── backgrounds/                   Fondos en PNG y WebP
│   ├── paramoamanecer.*
│   ├── paramoarcoiris.*
│   ├── paramoatardecer.*
│   ├── paramodia.*
│   ├── paramonoche.*
│   └── paramosol.*
│
├── nfc/
│   └── index.html                 Entrada que redirige al modo NFC principal
│
├── public/                        Únicos datos y medios editoriales públicos
│   ├── data/
│   │   ├── quotes.json            Contrato público de citas
│   │   └── literary-profiles.json Perfiles públicos de autores y obras
│   └── images/authors/            Retratos WebP y sus créditos en los perfiles
│
├── server/                        Backend HTTP del clima
│   ├── index.js                   GET /api/weather-state; host/puerto
│   ├── weatherProvider.js         Open-Meteo, mapeo y fallback seguro
│   ├── weatherMapping.js          Esquema y normalización del estado
│   ├── weatherStateStore.js       Caché, persistencia y override
│   ├── weather-state.json         Ruta local/legacy protegida en despliegue
│   └── weather-override.json      Ruta local/legacy protegida en despliegue
│
├── data/editorial/                Fuente editorial interna; nunca se publica
│   ├── README.md                  Reglas de edición y generación
│   ├── stable-identifiers.json    IDs públicos que no deben cambiar
│   ├── quotes.intermediate.json   Extracción automática histórica
│   ├── quotes.normalized.draft.json
│   ├── authors.draft.json
│   ├── works.draft.json
│   ├── sources.draft.json
│   ├── originals.manual.json
│   ├── author-profiles.manual.json
│   ├── work-profiles.manual.json
│   ├── editorial-decisions.json   Registro de decisiones humanas
│   ├── *.schema.json              Contratos de validación
│   ├── *-report.json              Informes generados
│   ├── editorial-review.md
│   └── rights-review.md
│
├── scripts/                       Herramientas Node ESM
│   ├── build-public-quotes.mjs
│   ├── build-public-literary-profiles.mjs
│   ├── validate-editorial-*.mjs
│   ├── normalize-editorial-drafts.mjs
│   ├── prepare-directus-*.mjs
│   ├── configure-directus-*.mjs
│   ├── export-directus-quotes-preview.mjs
│   ├── approve-directus-current-catalog.mjs
│   ├── prepare-directus-quotes-publication.mjs
│   ├── stage-directus-quotes-publication.mjs
│   ├── finalize-directus-quotes-deployment.mjs
│   ├── restore-directus-quotes-backup.mjs
│   ├── simulate-directus-publication-changes.mjs
│   ├── set-weather-override.mjs
│   └── lib/                        Escritura atómica, hashes y verificación
│
├── ops/directus/                  Infraestructura editorial; no se publica
│   ├── compose.yaml               Directus 12.3 + PostgreSQL 16.14 fijados
│   ├── migrations/                Esquema SQL inicial
│   ├── schema/                    Snapshot declarativo de Directus
│   ├── systemd/                   Timers y servicios de copias/restauración
│   ├── backup-database.sh
│   ├── offsite-backup.sh
│   ├── test-database-restore.sh
│   ├── configure-offsite-backup.sh
│   ├── restic.env.example
│   └── README.md
│
├── tests/                         Pruebas Node sin framework externo
│   ├── quote*.test.js             Citas, originales y datos públicos
│   ├── weather*.test.js           Proveedor, mapeo y escenas
│   ├── dayNight.test.js
│   ├── fireflies.test.js
│   ├── nfcExperience.test.js
│   ├── sceneBackground.test.js
│   └── directus*.test.js          Importación, publicación, backup y restore
│
└── docs/                          Documentación temática y operativa
    ├── flujo-vps.md
    ├── arquitectura-directus.md
    ├── contrato-datos-editoriales.md
    ├── clima-real.md
    ├── frases-json-publico.md
    ├── originales-fragmentos.md
    ├── retratos-autores.md
    ├── probar-escenas-clima.md
    └── pruebas-escenas-visuales.md
```

## 6. Cómo funciona el frontend

`index.html` carga `style.css` y `script.js`. `script.js` importa los módulos
especializados y coordina el estado de la página.

Secuencia simplificada de una visita:

1. Se detecta si la URL corresponde a una entrada normal o NFC.
2. Se cargan y validan `quotes.json` y `literary-profiles.json`.
3. Se recupera del almacenamiento local el historial de citas vistas.
4. Se elige una cita no vista o la cita fijada por NFC.
5. Se consulta `/api/weather-state`.
6. La hora del dispositivo determina `dawn`, `day`, `sunset` o `night`.
7. La hora local se combina con el clima global para seleccionar fondo y efectos.
8. La persona puede revelar original, ficha, controles y otra cita.

Si el catálogo no puede cargarse, `publicQuotes.js` dispone de un conjunto pequeño
de citas de emergencia. Si el clima falla, se conserva un estado visual seguro.

## 7. Clima y escenas

El proyecto usa un modelo deliberadamente respetuoso con la privacidad:

- no solicita geolocalización al visitante;
- la hora visual procede del reloj local de su dispositivo;
- el clima es único para toda la web;
- el backend usa unas coordenadas simbólicas configuradas en la VPS;
- esas coordenadas no aparecen en la respuesta pública.

En producción, el backend está diseñado para escuchar en `127.0.0.1:3030` y Nginx
actúa como proxy para `/api/weather-state`. El proveedor es Open-Meteo y no
requiere API key. Ante errores de red o configuración responde con un fallback.

Variables relevantes:

```text
PARAMO_WEATHER_HOST
PARAMO_WEATHER_PORT
PARAMO_WEATHER_PROVIDER
PARAMO_WEATHER_LATITUDE
PARAMO_WEATHER_LONGITUDE
PARAMO_WEATHER_TIMEZONE
PARAMO_WEATHER_TTL_MINUTES
PARAMO_WEATHER_STATE_FILE
PARAMO_WEATHER_OVERRIDE_FILE
```

No deben copiarse valores de producción a un servicio externo de IA.

## 8. Modelo de datos editorial

Hay tres niveles de información:

1. **Interno canónico:** borradores, originales, perfiles y decisiones
   versionadas bajo `data/editorial/`.
2. **Privado editorial:** notas, derechos, revisión, fuentes de trabajo y
   auditoría en archivos internos o Directus/PostgreSQL.
3. **Público:** campos expresamente exportados a los dos JSON bajo `public/data/`.

Los identificadores como `quote-123`, `author-mary-shelley` o
`work-frankenstein-o-el-moderno-prometeo` son contratos estables. Corregir un
nombre o título no debe cambiar su ID.

No se deben editar manualmente los artefactos generados cuando existe un archivo
canónico y un generador. Antes de cambiar datos hay que consultar
`data/editorial/README.md` y `docs/contrato-datos-editoriales.md`.

## 9. Directus y PostgreSQL

Directus es el panel editorial privado; PostgreSQL conserva el modelo relacional.
El Compose actual:

- fija Directus 12.3.0 y PostgreSQL 16.14 mediante versión y digest;
- expone Directus únicamente en `127.0.0.1:8055`;
- no publica el puerto de PostgreSQL;
- monta uploads y extensiones desde `/var/lib/paramo-directus/`;
- lee secretos desde `/etc/paramoliterario/directus/`;
- impone límites de memoria, CPU y procesos;
- no escribe automáticamente los JSON públicos.

El acceso remoto previsto se realiza mediante túnel SSH, no abriendo el puerto
8055 a Internet.

La publicación editorial sigue varias barreras: previsualizar, validar, registrar
el intento, preparar atómicamente el JSON, revisar/versionar el diff, desplegar y
confirmar que Git, `/var/www` y HTTPS contienen exactamente el mismo hash.

## 10. Entornos y rutas de la VPS

```text
/srv/paramoliterario/source/             Repositorio y zona de trabajo
/var/www/paramo-literario/               Copia servida por Nginx
/etc/paramoliterario/weather.env         Configuración privada del clima
/var/lib/paramo-literario/               Estado mutable del clima
/etc/paramoliterario/directus/           Secretos de Directus/PostgreSQL
/var/lib/paramo-directus/                 Uploads y extensiones
volumen paramo-directus-postgres         Datos PostgreSQL
```

La copia pública no se debe editar. `deploy-local.sh` sincroniza desde la fuente y
excluye Git, pruebas, documentación, scripts internos, `data/editorial`, `ops`,
secretos, logs y datos runtime.

## 11. Comandos habituales

### Proyecto y pruebas

```bash
npm test
npm run validate:editorial
node --check script.js
git diff --check
```

### Backend del clima en desarrollo

```bash
npm run weather:start
curl http://127.0.0.1:3030/api/weather-state
```

Sin coordenadas configuradas, el fallback es un comportamiento esperado y seguro.

### Publicación en la VPS

```bash
./deploy-local.sh --check
./deploy-local.sh --dry-run
./deploy-local.sh --publish
```

`--publish` exige escribir `PUBLICAR`. El script no hace commits, no hace push,
no recarga Nginx y no administra Directus.

### Directus en el host configurado

```bash
docker compose -f ops/directus/compose.yaml config
docker compose -f ops/directus/compose.yaml up -d
docker compose -f ops/directus/compose.yaml ps
```

Estos comandos no funcionarán sin adaptación en un ordenador local porque el
Compose referencia rutas absolutas de la VPS.

## 12. Qué viaja al clonar Git

Una clonación normal incluye:

- frontend, backend y recursos gráficos versionados;
- catálogo público actual;
- datos editoriales versionados;
- pruebas, scripts, documentación y esquema de infraestructura;
- migraciones y snapshot declarativo de Directus.

No incluye:

- la base PostgreSQL activa;
- el volumen Docker `paramo-directus-postgres`;
- uploads o extensiones bajo `/var/lib/paramo-directus/`;
- configuración y secretos bajo `/etc/paramoliterario/`;
- estado mutable bajo `/var/lib/paramo-literario/`;
- configuración de Nginx y unidades systemd instaladas en el host;
- copias cifradas externas ni credenciales de almacenamiento.

Por tanto, **Git basta para desarrollar y probar la web**, pero no para reproducir
todo el CMS y la operación de producción.

## 13. Plan seguro para llevarlo a local

### Nivel A: desarrollo de la web

Es el traslado recomendado para empezar.

1. Instalar Git y Node.js. El proyecto funciona actualmente en Node 18.19.1; las
   comprobaciones de GitHub usan Node 22. Conviene estandarizar posteriormente una
   versión LTS mediante `.nvmrc` o equivalente.
2. Clonar el repositorio privado.
3. Ejecutar `npm test`.
4. Servir la raíz con un servidor HTTP local. Abrir `index.html` directamente con
   `file://` no es suficiente porque el frontend usa módulos ESM y `fetch`.
5. Iniciar `npm run weather:start` en otra terminal si se quiere probar el endpoint.
6. Configurar el servidor web local para enviar `/api/weather-state` al puerto
   3030, o aceptar temporalmente el fallback visual del cliente.

El `package.json` no declara dependencias externas ni existe un paso de build; en
el estado actual no debería ser necesario `npm install` para ejecutar las pruebas.

### Nivel B: réplica local del CMS

Solo es necesario para trabajar con Directus y los datos activos.

1. Crear primero una copia PostgreSQL mediante el procedimiento documentado de
   backup; no copiar manualmente los archivos internos del volumen en caliente.
2. Transferir el dump por un canal cifrado.
3. Copiar los uploads necesarios por separado.
4. Crear secretos locales nuevos. No reutilizar las contraseñas de producción.
5. Crear un `compose.local.yaml` o variables locales que sustituyan los mounts
   absolutos `/etc/paramoliterario/...` y `/var/lib/paramo-directus/...`.
6. Restaurar el dump en una base local aislada.
7. Comprobar recuentos e integridad sin escribir en producción.
8. Mantener Directus local en loopback y sin API anónima mientras se revisa.

### Nivel C: réplica de operación

Nginx, systemd, backups offsite y rutas `/etc`/`/var/lib` pertenecen a la operación
de la VPS. No es necesario reproducirlos para desarrollar. Si se necesita un
entorno de ensayo fiel, debe documentarse y construirse aparte; no conviene hacer
que el portátil imite accidentalmente rutas o credenciales de producción.

## 14. Información que no debe compartirse con una IA externa

Aunque el consultor sea de confianza, cualquier plataforma externa debe recibir
solo el contexto mínimo necesario. No compartir:

- contraseñas o secretos de Directus/PostgreSQL;
- claves SSH, cookies, tokens de GitHub o credenciales de backups;
- contenido de `/etc/paramoliterario/`;
- dumps completos sin revisar si pueden contener usuarios, auditoría o datos
  privados;
- URLs firmadas, configuración de restic o destinos offsite;
- logs que puedan contener cabeceras, rutas privadas o identificadores de sesión.

Sí se puede compartir este documento, el árbol, los módulos de frontend, los
contratos públicos y fragmentos concretos de código necesarios para una decisión.

## 15. Propuesta para reducir consumo de tokens con IA

No hace falta introducir de inmediato un framework pesado. El mayor ahorro suele
venir de mejorar la selección de contexto y de dividir el proyecto por dominios.

### Contexto estable recomendado

Mantener un paquete pequeño de documentos que la IA pueda leer según la tarea:

```text
docs/ai/
├── 00-project-map.md              Resumen de una página
├── frontend.md                    Entradas, módulos y contratos del navegador
├── editorial-data.md              Fuentes canónicas y archivos generados
├── weather.md                     API, variables y escenas
├── directus.md                    Modelo, publicación y operación
├── deployment.md                  Fuente, producción y límites
└── decisions.md                   Decisiones arquitectónicas vigentes
```

Este documento integral puede ser la fuente inicial para generar ese conjunto,
pero no debería cargarse entero para cada tarea pequeña.

### Instrucciones por carpeta

Un archivo de instrucciones raíz debe contener solo reglas universales. Las reglas
especializadas pueden vivir junto a cada dominio, por ejemplo:

```text
AGENTS.md
server/AGENTS.md
data/editorial/AGENTS.md
ops/directus/AGENTS.md
```

Así una IA que modifica un efecto visual no necesita consumir toda la política de
backups de PostgreSQL, y una IA editorial no necesita cargar el CSS completo.

### Índices en lugar de archivos completos

- Mantener un mapa de módulos y sus responsabilidades.
- Registrar qué archivos son fuente y cuáles son generados.
- Añadir comandos de verificación por dominio.
- Guardar decisiones duraderas como ADR breves.
- Pedir a la IA que busque primero símbolos concretos con `rg`.
- Evitar adjuntar JSON grandes: proporcionar esquema, recuento y uno o dos ejemplos.
- Cargar pruebas relacionadas con el cambio, no toda la suite como contexto.

### Fronteras de trabajo sugeridas

1. `frontend-experience`: interfaz, citas, NFC, audio y efectos.
2. `weather-service`: endpoint, proveedor, caché y mapeo visual.
3. `editorial-pipeline`: datos versionados, validación y JSON público.
4. `directus-cms`: modelo, importación, publicación y backups.
5. `operations`: Nginx, systemd, despliegue y observabilidad.

Estas son fronteras de contexto; no exigen convertir ahora el repositorio en un
monorepo ni mover archivos antes de entender las dependencias.

## 16. Decisiones que conviene tomar con el consultor

1. Qué problema concreto debe resolver el “framework de IA”: selección automática
   de contexto, memoria de decisiones, agentes especializados, RAG local o todo lo
   anterior.
2. Si se mantiene un único repositorio o se separa infraestructura de aplicación.
3. Qué versión de Node se estandariza y cómo se declara.
4. Si Directus local usará datos ficticios, un subconjunto anonimizado o una copia
   privada completa.
5. Cómo se gestionarán secretos localmente.
6. Qué archivos generados deben seguir versionados.
7. Cómo se detectará automáticamente una edición accidental de un artefacto
   generado.
8. Qué documentación mínima debe actualizarse en cada cambio arquitectónico.
9. Si merece la pena añadir tipos, esquemas compartidos o TypeScript sin convertir
   la migración técnica en un objetivo mayor que el producto.
10. Qué métricas demostrarán la reducción de tokens: contexto enviado por tarea,
    coste, latencia, tasa de relectura y errores por falta de contexto.

## 17. Riesgos y deuda observada

- El Compose de Directus contiene rutas absolutas específicas de la VPS; no es
  portable sin una capa local.
- La versión de Node no está declarada en el repositorio. Producción observada usa
  Node 18.19.1 y GitHub Actions usa Node 22.
- `.gitignore` parece contener texto duplicado y codificación UTF-16; conviene
  normalizarlo con cuidado antes de ampliar reglas.
- La raíz mezcla frontend, backend y módulos visuales. Es manejable, pero el mapa
  de contexto debe ser explícito antes de mover archivos.
- La copia pública conserva al menos un archivo de prueba residual de un despliegue
  antiguo. El script actual excluye `tests/`, pero una exclusión de rsync no elimina
  necesariamente residuos ya existentes.
- Algunos archivos JSON son grandes y costosos como contexto de IA; deben
  consultarse por esquema, campos, IDs o fragmentos específicos.
- La documentación es rica, pero está distribuida. Hay riesgo de que una IA lea un
  documento histórico sin distinguirlo del estado operativo vigente.

No se recomienda reorganizar directorios, introducir un framework o dividir el
repositorio hasta disponer de una copia local verificada y una línea base de
pruebas correcta.

## 18. Criterio de éxito del traslado

La copia local básica puede considerarse correcta cuando:

- el commit local coincide con el commit elegido de `main`;
- `npm test` termina correctamente;
- la web carga por HTTP local;
- se pueden leer las 640 citas y los perfiles públicos;
- el modo normal y el modo NFC funcionan;
- el fallo o ausencia del backend del clima degrada de forma segura;
- no se ha copiado ningún secreto al repositorio;
- está documentado si Directus se ha trasladado o se ha dejado deliberadamente en
  la VPS.

Si también se replica el CMS, añadir:

- Directus y PostgreSQL saludables en local;
- recuentos cotejados con el backup;
- uploads accesibles;
- API anónima cerrada;
- secretos locales distintos de producción;
- prueba de exportación dirigida a `/tmp`, sin tocar el JSON público.

## 19. Documentos de referencia

- `docs/flujo-vps.md`: rutas, publicación, servicio del clima y límites operativos.
- `docs/arquitectura-directus.md`: arquitectura objetivo y modelo del CMS.
- `ops/directus/README.md`: estado y operación detallada del piloto.
- `data/editorial/README.md`: reglas de edición del catálogo versionado.
- `docs/contrato-datos-editoriales.md`: separación entre campos internos,
  privados y públicos.
- `docs/clima-real.md`: proveedor, privacidad, mapeo y fallback.
- `docs/frases-json-publico.md`: contrato y generación de citas.
- `docs/originales-fragmentos.md`: tratamiento de textos originales.

## 20. Resumen para entregar a otro profesional o IA

Páramo Literario es una web literaria estática sin framework que presenta un
catálogo de citas dentro de una escena atmosférica. El navegador consume JSON
versionado y un endpoint Node de clima; no consulta Directus. La edición futura se
gestiona en un Directus/PostgreSQL privado y solo llega a producción mediante una
exportación validada, revisión humana y despliegue manual desde la VPS. Git contiene
todo lo necesario para desarrollar la web, pero no la base activa, secretos,
uploads ni estado runtime. La reorganización para IA debe priorizar mapas de
contexto pequeños, instrucciones por dominio y búsqueda selectiva antes de adoptar
un framework o mover la arquitectura.
