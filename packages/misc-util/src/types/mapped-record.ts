import { O } from 'ts-toolbelt';

export type MappedRecord<T extends object, V> = Record<O.RequiredKeys<T>, V> & Partial<Record<O.OptionalKeys<T>, V>>;
