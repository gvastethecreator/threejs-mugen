# ADR 0060 — Input authority (DA30-031)

- **Status:** Accepted (design)
- **Seat ownership:** P1/P2 seats own device binding; UI focus does not steal combat seat without explicit handoff.
- **Merge order:** keyboard edges → gamepad axes/buttons → touch clusters; last edge wins per SOCD policy.
- **Demo/replay:** replay samples override live devices when replay active.
- **Disconnect:** mid-hold unplug synthesizes release; reconnect requires remap confirmation.
- **Sample point:** once per logic tick after command buffer push.
