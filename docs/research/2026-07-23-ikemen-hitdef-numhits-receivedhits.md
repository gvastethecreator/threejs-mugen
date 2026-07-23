# IKEMEN HitDef NumHits ReceivedHits Research

Date: 2026-07-23

## Question

Should a normal direct HitDef add its authored `numhits` to `ReceivedHits`?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [HitDef numhits compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)
- [HitDef reset default](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L764)
- [Normal-hit combo and received-hit update](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11283-L11300)

## Findings

- IKEMEN stores `numhits` on HitDef with a default of one.
- On a normal hit, the same absolute-result-one branch adds `hd.numhits` to
  the target's received-hit count.
- The local direct move already carries `HitDefControllerOp.hitCount` into
  `RuntimeGetHitVars.hitCount`, but the contact-memory write only added one.

## Local decision

Keep the existing direct damage write, then add the remaining authored hit
count through the bounded received-hit memory API. This preserves the current
damage lifecycle while making `ReceivedHits` equal the direct HitDef count.

## Limits

Projectile `projhits`, FightScreen combo display, score, dynamic `numhits`,
teams, exact state timing, overflow parity, and full MUGEN/IKEMEN parity stay
outside this cut.
