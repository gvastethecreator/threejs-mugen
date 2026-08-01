# Rooftop Dojo

Pack parallax v2 regenerado para el runtime del port.

- Fuente maestra: `source/rooftop-dojo-base-imagegen-v2.png` y alias runtime `/stages/rooftop-dojo/rooftop-dojo.png`.
- Capas: `background-pack.json` declara far/mid/near con profundidad y scroll; las capas v2 conservan píxeles del proveedor y sólo aplican máscaras/atenuación deterministas.
- Dirección: dojo nocturno de combate, carbón/umber/pizarra, anatomía tipo Baki y cero neón/texto/logos.
- Validación: `validate_background_pack.py` genera `qa/background-composite.png` y `qa/background-scroll.gif` con provenance `imagegen` representativa.
