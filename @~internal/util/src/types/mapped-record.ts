import type { O } from 'ts-toolbelt';

// eslint-disable-next-line @typescript-eslint/ban-types
export type MappedRecord<T extends object, V> = Record<O.RequiredKeys<T>, V> & Partial<Record<O.OptionalKeys<T>, V>>;
