# Patio Dojo Publicidad

Pack parallax v2 regenerado para el port MUGEN/Ikemen. El contrato de cámara es 1672×941, 16:9, con zona segura central para los luchadores. La dirección visual es pixel art de combate severo, anatomía tipo Baki y paleta carbón/óxido/hueso sin neón.

- `source/*imagegen.png`: alias estables de las capas v2 derivadas de una escena maestra Imagegen.
- `source/*-v2.png`: fuentes y capas v2; el `source-provenance.json` registra el maestro y las transformaciones deterministas.
- `source/*near-alpha.png`: plano cercano con máscara alfa vertical, sin pintar reemplazos.
- `background-pack.json`: orden, profundidad, hashes y factores de parallax.
- `qa/background-composite.png`: prueba de composición.
- `qa/background-scroll.gif`: prueba de desplazamiento por capa.

Validación: `validate_background_pack.py` pasa con `representative=true` y provenance `imagegen`.
