import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";

export function runtimeChainIdOverridesEqualNoChainId(
  profile: RuntimeCompatibilityProfile | undefined,
  chainId: number | undefined,
  noChainId: number,
): boolean {
  return profile === "mugen-1.1"
    && chainId !== undefined
    && chainId >= 0
    && Math.trunc(chainId) === noChainId;
}
