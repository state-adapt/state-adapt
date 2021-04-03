import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export function splitSources<
  K extends string,
  Message extends { type: K },
  PartitionKeys extends { [index: string]: K },
  PartitionedSources extends {
    [SK in keyof PartitionKeys]: Observable<
      Message extends Record<'type', PartitionKeys[SK]> ? Message : never
    >;
  }
>(obs$: Observable<Message>, partitions: PartitionKeys) {
  return Object.entries(partitions).reduce(
    (sources, [name, type]) => ({
      ...sources,
      [name]: obs$.pipe(filter(val => val.type === type)),
    }),
    {} as PartitionedSources,
  );
}
