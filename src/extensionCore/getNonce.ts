// src\extension\getNonce.ts

export function getNonce() {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}
