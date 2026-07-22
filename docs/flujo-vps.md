# Flujo de trabajo VPS-first

## Estructura

La carpeta de trabajo y repositorio Git es:

```text
/srv/paramoliterario/source
```

Todo el trabajo con Codex, las ediciones, pruebas y operaciones Git se hace allí.

La copia pública es:

```text
/var/www/paramo-literario
```

No debe editarse directamente: los cambios quedarían fuera del historial y podrían desaparecer en la siguiente publicación. La publicación se hace únicamente desde la carpeta de trabajo mediante `deploy-local.sh`.

## Probar y publicar

Desde la raíz del repositorio:

```bash
./deploy-local.sh --check
./deploy-local.sh --dry-run
```

`--check` ejecuta las pruebas, comprueba la sintaxis de los JavaScript versionados, valida el diff y muestra el estado de Git. `--dry-run` repite esas comprobaciones y simula `rsync` sin escribir en la web pública.

Solo después de revisar la simulación se publica manualmente:

```bash
./deploy-local.sh --publish
```

La copia real requiere escribir exactamente `PUBLICAR`. El script no recarga Nginx, no cambia propietarios y no hace commits ni pushes.

## Backend del clima

El backend está gestionado por systemd:

```text
Unidad:   paramo-weather.service
Estado:   active y enabled
Usuario:  paramoliterario
Escucha:  127.0.0.1:3030
```

El código ejecutado está en la copia pública, pero los datos mutables están fuera de ella:

```text
Estado:    /var/lib/paramo-literario/weather-state.json
Override:  /etc/paramoliterario/weather-override.json
```

PM2 ya no gestiona aplicaciones. El backend no debe volver a iniciarse simultáneamente con PM2 porque ambos intentarían ocupar el puerto 3030.

Comprobaciones habituales:

```bash
systemctl status paramo-weather.service --no-pager
systemctl is-enabled paramo-weather.service
curl --fail --show-error http://127.0.0.1:3030/api/weather-state
curl --fail --show-error https://paramoliterario.com/api/weather-state
```

Para consultar logs sin reiniciar nada:

```bash
sudo journalctl -u paramo-weather.service -n 80 --no-pager
```

## Límites de rsync

`rsync` publica código desde `/srv/paramoliterario/source/` hacia `/var/www/paramo-literario/`. Nunca debe:

- Escribir en `/etc/paramoliterario` o `/var/lib/paramo-literario`.
- Copiar, sobrescribir o borrar datos runtime.
- Copiar `.git`, `.github`, `.agents`, `.codex`, `.vscode`, `.idea`, `node_modules`, pruebas, documentación operativa, logs, temporales o archivos `tar.gz`.
- Usar `--delete-excluded`.
- Recargar Nginx, cambiar propietarios o gestionar servicios.

Los filtros para `server/weather-state.json`, `server/weather-override.json`, `.env` y `runtime/` deben conservarse. Protegen las rutas antiguas durante la transición y evitan que datos locales entren en la copia pública.

## GitHub

GitHub se usa como copia e historial puntual. Los commits y pushes son manuales:

```bash
git status
git add <archivos>
git commit -m "Descripción del cambio"
git push origin main
```

Un push no despliega automáticamente. GitHub Actions está configurado con `workflow_dispatch`, por lo que solo puede iniciarse manualmente.

No se debe ejecutar el workflow manual antiguo sin revisarlo antes: su lógica de despliegue puede no coincidir con las protecciones actuales y contiene operaciones de permisos y recarga de Nginx que no forman parte del flujo VPS-first.

## Rollback excepcional hacia PM2

Se conserva un backup de la antigua configuración:

```text
/root/.pm2/dump.pm2.backup-20260722T124938Z
```

El rollback solo debe hacerse de forma deliberada y durante una incidencia. Primero se libera el puerto deteniendo y deshabilitando systemd; después se restaura PM2:

```bash
sudo systemctl disable --now paramo-weather.service
sudo install -o root -g root -m 0644 \
  /root/.pm2/dump.pm2.backup-20260722T124938Z \
  /root/.pm2/dump.pm2
pm2 resurrect
```

Después hay que comprobar ambos endpoints y confirmar que solo un proceso escucha en 3030. Si `pm2 resurrect` restaura la definición pero no inicia la aplicación, se puede ejecutar `pm2 start paramo-weather`.

## Qué no tocar

- No editar `/var/www/paramo-literario` directamente.
- No editar ni borrar manualmente el estado de `/var/lib`.
- No sobrescribir el override de `/etc` durante una publicación.
- No ejecutar simultáneamente el backend mediante systemd y PM2.
- No recargar Nginx ni cambiar propietarios como parte del despliegue.
- No instalar Directus o PostgreSQL como parte de este flujo.
