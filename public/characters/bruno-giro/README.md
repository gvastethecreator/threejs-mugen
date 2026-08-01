# Bruno Giro

Luchador de judo de espalda y cadera potentes: gi azul pizarra, cinturón arena y vendas marrón oscuro. La regeneración v2 usa anatomía de manga de combate tipo Baki y ropa sobria.

- Atlas: `sprite-sheet-alpha.png` + `manifest.json`
- Fuentes: doce filas provider independientes (`idle`, `walk-forward`, `walk-back`, `guard`, `special`, `throw`, `light-strike`, `heavy-strike`, `win`, `hitstun`, `knockdown` y `ko`); el action-grid queda sólo para `crouch`/`jump`, todo enlazado en `source-provenance.json` y `regeneration-map.json`.
- QA: `qa/identity-consistency-report.json`, `qa/frame-alignment-report.json`,
  `qa/animation-contract-report.json`, `qa/motion-variation-report.json`
- MUGEN-lite: `mugen/bruno.def`, `.cmd`, `.cns`, `.air` y `runtime-states.json` cubren el núcleo de juego.
- Pendiente: identity-consistency sigue rojo en filas legacy y colapso (`knockdown`/`ko`), escala residual de `special`, variación de `heavy-strike` y un borde de cabeza en `win`; `hitstun` ya no añade errores al proxy. La revisión visual mantiene el gate rojo. El contrato automatizado ya inspecciona los 14 estados y el nuevo `ko` tiene seis fases reproducibles. También faltan paletas secundarias, SFF binario nativo y colisiones por frame.


