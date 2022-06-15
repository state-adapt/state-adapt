import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';

export function splitSources<
  K extends string,
  Message extends { type: K },
  PartitionKeys extends { [index: string]: K },
  PartitionedSources extends {
    [SK in keyof PartitionKeys]: Observable<
      Message extends Record<'type', PartitionKeys[SK]> ? Message : never
    >;
  },
>(obs$: Observable<Message>, partitions: PartitionKeys) {
  return Object.entries(partitions).reduce(
    (sources, [name, type]) => ({
      ...sources,
      [name]: obs$.pipe(
        share(), // Each and every filtered source would cause everything upstream to run for iteslf
        filter(val => val.type === type),
      ),
    }),
    {} as PartitionedSources,
  );
}
