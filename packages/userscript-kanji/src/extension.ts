export interface Extension {
   run(): Promise<void>;
}

export abstract class AbstractExtension implements Extension {
   abstract run(): Promise<void>;
}
