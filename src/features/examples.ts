export const examples: Record<string, string> = import.meta.glob(
  "@/assets/examples/*",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);
