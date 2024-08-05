
export type Gamemode = "attack" | "survival" | "pvp" | "hexed";

export function isGamemode(key: string): key is Gamemode {
    return ["attack", "survival", "pvp", "hexed"].includes(key);
  }
  