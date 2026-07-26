# Global checkpoint DA28-02

Date: 2026-07-26  
Type: global re-gate  
Status: closed  
Pin SHA: `32466c6e8bb4ec3f414a0cda032af24ea241e5c6`

## Suite

| Gate | Result |
| --- | --- |
| TypeScript 7 (`pnpm typecheck`) | passed |
| Vitest | **270** files / **2850** tests passed |
| Traces (`pnpm qa:trace`) | **663** / 663 passed (0 failed) |
| Build (`pnpm build`) | passed (340 modules; large-chunk warning non-blocking) |
| Boundaries (`pnpm check:boundaries`) | passed |
| Redirect boundary | passed |
| Studio gate evidence materialize | passed (`architecture-boundaries`) |

## Fix on the gate tip

`CommonFxFightScreenProof` no longer imports `game/audio/MugenAudioSystem` from
`mugen/*`. Audio playback uses an injected `CommonFxAudioProbe`. Tests supply
`MugenAudioSystem`. This restores the architecture boundary that blocked the
first DA28-02 suite attempt at `bbed0201`.

## Claim allowed

- Global gate for pin `32466c6e…` with the measured typecheck/test/trace/build/boundary results
- formal/global cursors may advance to this pin
- DA28-02 closed; next live cut is DA28-03

## Claim blocked

- Score movement
- Replacing T342 visual/product pins without a new bounded matrix
- Claiming full `qa:smoke` browser matrix from this gate alone
- Claiming DA28-03…30 product/runtime closes from this re-gate
- Projecting older 268/2845 or `b7d23801` numbers as current formal/global

## Next

DA28-03 bounded visual/product subcursors for DA27-07/08/09 routes.
