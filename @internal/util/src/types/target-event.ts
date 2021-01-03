export type TargetEvent<T extends EventTarget | null, E extends Event = Event> = E & { readonly currentTarget: T };
