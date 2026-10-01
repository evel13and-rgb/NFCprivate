# Operación del panel editorial propio

Estos archivos preparan el panel como servicio privado del VPS. No se instalan
ni activan mediante `deploy-local.sh`.

## Arquitectura operativa

- Nginx sirve `https://paramoliterario.com/editorial/`.
- `paramo-editorial.service` escucha únicamente en `127.0.0.1:3040`.
- El backend habla con Directus únicamente en `127.0.0.1:8055`.
- PostgreSQL continúa sin puerto publicado.
- La web pública no consulta ninguno de estos servicios.

## Instalación deliberada

Primero hay que publicar el código mediante el flujo habitual y comprobar que
existen en `/var/www/paramo-literario/` las carpetas `editorial/` y `server/`.

Después, en una ventana de operación separada:

```sh
sudo install -o root -g root -m 0644 \
  ops/editorial/systemd/paramo-editorial.service \
  /etc/systemd/system/paramo-editorial.service

sudo systemctl daemon-reload
sudo systemctl enable --now paramo-editorial.service
```

La directiva de `nginx/paramo-editorial-http.conf` se incorpora al contexto
`http {}`. Las ubicaciones de `nginx/paramo-editorial-server.conf` se incorporan
al servidor HTTPS. Antes de recargar:

```sh
sudo nginx -t
```

La recarga de Nginx y la instalación de la unidad son operaciones manuales; este
repositorio no las ejecuta automáticamente.

## Comprobaciones

```sh
systemctl status paramo-editorial.service --no-pager -l
curl --fail --show-error http://127.0.0.1:3040/editorial/api/health
curl --fail --show-error https://paramoliterario.com/editorial/api/health
```

El segundo endpoint solo confirma que el panel alcanza Directus; no expone datos
editoriales ni permite trabajar sin iniciar sesión.

## Logs y rollback

```sh
sudo journalctl -u paramo-editorial.service -n 100 --no-pager
sudo systemctl disable --now paramo-editorial.service
```

Si se retira la configuración de Nginx, hay que ejecutar `sudo nginx -t` antes de
recargar. Detener el panel no afecta a la web pública ni a sus JSON estáticos.
