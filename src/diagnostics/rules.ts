// Owner mapping rules; keep simple and adjust as needed.
export type OwnerRule = { pattern: RegExp; owner: string };

export const rules: OwnerRule[] = [
  { pattern: /documentation|diagram|kb/i, owner: "KnowledgeBase" },
  { pattern: /discovery|call/i, owner: "DiscoveryCalls" },
  { pattern: /message|chat/i, owner: "Messaging" },
  { pattern: /client|dashboard/i, owner: "Client" },
  { pattern: /trainer|profile/i, owner: "Trainer" },
  { pattern: /.*/, owner: "Core" },
];
