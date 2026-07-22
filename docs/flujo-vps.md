# Flujo de trabajo en el VPS

## Dónde trabajar

Todo el trabajo con Codex y las ediciones se hace en:

```text
/srv/paramoliterario/source
```

`/var/www/paramo-literario` es únicamente la copia pública. No debe editarse directamente porque esos cambios quedarían fuera del historial y podrían desaparecer en la siguiente publicación.

## Cómo probar

Desde la raíz del repositorio:

```bash
./deploy-local.sh --check
```

Este comando ejecuta las pruebas, comprueba la sintaxis de los JavaScript versionados, valida el diff y muestra el estado de Git.

Para ver qué cambiaría en producción sin escribir nada:

```bash
./deploy-local.sh --dry-run
```

## Cómo publicar

Solo cuando las pruebas y la simulación sean correctas:

```bash
./deploy-local.sh --publish
```

El script repite las comprobaciones y la simulación. La copia real solo comienza después de escribir exactamente `PUBLICAR`. No recarga Nginx, no cambia propietarios y no hace operaciones Git.

Los archivos runtime `server/weather-state.json`, `server/weather-override.json`, `.env` y el directorio `runtime/` están ocultos y protegidos frente al despliegue.

## Copia e historial en GitHub

Guardar los cambios de forma puntual:

```bash
git status
git add <archivos>
git commit -m "Descripción del cambio"
git push origin main
```

Los commits y pushes son siempre manuales. GitHub Actions ya no se ejecuta con cada push: el workflow de despliegue solo puede iniciarse manualmente con `workflow_dispatch`.

## Qué no tocar

- No editar `/var/www/paramo-literario` directamente.
- No copiar `.git`, `.github`, `.agents`, `.codex`, documentación operativa, dependencias, pruebas ni temporales a producción.
- No sobrescribir ni borrar los archivos runtime protegidos.
- No recargar Nginx ni cambiar propietarios como parte de este flujo.
- No instalar Directus o PostgreSQL como parte de la publicación.
