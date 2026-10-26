# La Parada del Tigre — Sitio web

Sitio web del **Centro Recreacional La Parada del Tigre** (Km 2 Vía al Tigre, Curumaní, Cesar).
Sitio estático (HTML + CSS + JS), sin dependencias ni compilación.

## Páginas

- `index.html` — Inicio: bienvenida, servicios (piscina/pasadía, cabañas, restaurante y bar, eventos, cancha natural, parque infantil), menú destacado, eventos con formulario de reserva por WhatsApp, galería, ubicación y contacto.
- `menu.html` — Menú completo: buscador, categorías y pedido que se envía armado por WhatsApp.

## Cambiar precios o productos del menú

Edita solo `assets/js/menu-data.js`. Cada producto tiene `name`, `price` (número en pesos, o `null` para "Consultar") y opcionalmente `desc`.

## Cambiar los números de WhatsApp

Los números (311 672 6001 y 311 673 7072) están en `assets/js/main.js` (`WHATSAPP`), en los selectores "Enviar a" y en los enlaces `wa.me/...` de `index.html` y `menu.html`.

## Publicar gratis con GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.

## Ver en local

Abre `index.html` en el navegador, o ejecuta `python3 -m http.server` y visita http://localhost:8000.
