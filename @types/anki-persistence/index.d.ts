declare const Persistence: {
   isAvailable(): boolean;
   clear(): void;
   getItem<T>(key?: string): T | null;
   setItem(key: string, value: unknown): void;
   setItem(value: unknown): void;
   removeItem(key?: string): void;
};
