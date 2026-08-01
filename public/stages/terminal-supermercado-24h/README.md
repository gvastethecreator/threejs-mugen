# Terminal Supermercado 24h

Pack parallax v2 regenerado para el port MUGEN/Ikemen. El contrato de cámara es 1672×941, 16:9, con el área central despejada para el combate. La escena usa carbón, azul pizarra, oliva y ámbar apagado, con contraste de manga de combate y sin luces saturadas.

- `source/terminal-supermercado-24h-base-imagegen.png`: alias estable del plano lejano v2.
- `source/terminal-supermercado-24h-mid-imagegen-v2.png`: plano medio derivado del maestro Imagegen.
- `source/terminal-supermercado-24h-near-alpha.png`: primer plano con máscara alfa vertical; no se pintaron reemplazos.
- `background-pack.json`: orden, profundidad, hashes y factores de parallax.
- `qa/background-composite.png`: prueba de composición.
- `qa/background-scroll.gif`: prueba de desplazamiento por capa.

Validación: `validate_background_pack.py` pasa con `representative=true` y provenance `imagegen`.
