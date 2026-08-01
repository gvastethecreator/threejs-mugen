# Azotea Wi-Fi

Pack parallax v2 regenerado para el port MUGEN/Ikemen. El contrato de cámara es 1672×941, 16:9, con el plano de juego libre en el centro. La dirección es una azotea de combate sobria en grafito, oliva y hueso, con profundidad de antenas y skyline.

- `source/azotea-wifi-base-imagegen.png`: alias estable del plano lejano v2.
- `source/azotea-wifi-mid-imagegen-v2.png`: plano medio derivado del maestro Imagegen.
- `source/azotea-wifi-near-alpha.png`: parapeto, cables y equipos del primer plano con máscara alfa vertical.
- `background-pack.json`: orden, profundidad, hashes y factores de parallax.
- `qa/background-composite.png`: prueba de composición.
- `qa/background-scroll.gif`: prueba de desplazamiento por capa.

Validación: `validate_background_pack.py` pasa con `representative=true` y provenance `imagegen`.
