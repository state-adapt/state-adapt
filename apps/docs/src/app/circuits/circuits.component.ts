import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, NgZone, OnInit, Input } from '@angular/core';

enum SourceType {
  WEBSOCKET = 'websocket',
  HTTP = 'http',
  CLOCK = 'clock',
  HTML = 'html',
}

interface Source {
  type: SourceType;
  active: boolean;
  x: number;
  y: number;
  translate: string;
  path: string;
}

enum SinkType {
  STORAGE = 'storage',
  HTTP = 'http',
  HTML = 'html',
}
interface Sink {
  type: SinkType;
  active: boolean;
  x: number;
  y: number;
  translate: string;
  path: string;
}

interface Circuit {
  i: number;
  sources: Source[];
  sinks: Sink[];
}

const getNumberBetween = (a: number, b: number) =>
  a + Math.floor((b - a + 1) * Math.random());

const getNumbersBetween = (
  a: number,
  b: number,
  n: number,
  ar: number[] = [],
  newN?: number,
): number[] => {
  if (!n) return ar;
  const nextNewN = getNumberBetween(a, b);
  const newNAlreadyChosen = newN != null && ar.indexOf(newN) !== -1;
  const newNValid = newN != null && !isNaN(newN) && !newNAlreadyChosen;
  return newN != null && newNValid
    ? getNumbersBetween(a, b, n - 1, [...ar, newN], nextNewN)
    : getNumbersBetween(a, b, n, ar, nextNewN);
};

const getRandomEl = <T>(ar: T[]) => {
  const i = getNumberBetween(0, ar.length - 1);
  return { i, el: ar[i] };
};
// const getRandomEls = <T>(ar: T[], a = 1, b?: number) => {
//   b = b ?? ar.length;
//   const n = Math.ceil((b - a) * Math.random());
//   const ns = getNumbersBetween(0, ar.length - 1, n);
//   return [ar, ns];
// };

// const updateAr = <T>(ar: T[], newEl: T, i: number) => [
//   ...ar.slice(0, i),
//   newEl,
//   ...ar.slice(i + 1),
// ];

const waitRandom = (min: number, n: number, fn: () => void) => {
  fn();
  setTimeout(() => waitRandom(min, n, fn), Math.max(min, n * Math.random()));
};

const mapIndex = (i: number, l1: number, l2: number) => Math.floor((i * l2) / l1);

const getTerminals = (gridWidth: number, n: number) =>
  getNumbersBetween(0, 2 * gridWidth - 1, n)
    .sort((a, b) => {
      const isABelow = a / gridWidth >= 1;
      const isBBelow = b / gridWidth >= 1;
      const switchFactor = isABelow && isBBelow ? -1 : 1;
      return (a - b) * switchFactor;
    })
    .filter(position => position % gridWidth) // Filter out first position
    .map((position, i) => {
      const gridHeight = gridWidth * 2;
      const cornerPosition = position % gridWidth;
      const isBelow = position / gridWidth >= 1;
      const order = isBelow
        ? (position - 1.5 * gridWidth) * -1 + 1.5 * gridWidth // Shift to center at 0, reflect, shift back
        : position;

      const height = Math.max(0, getNumberBetween(0, gridWidth - cornerPosition - 1));
      const midY = (gridHeight / 2) * 60;
      const y = midY - (isBelow ? -(height + 0.5) : height + 0.5) * 60; // -0.5 to get to center. height of 4 => y of 30 (half down)
      const x = (gridWidth - (cornerPosition + height + 0.5)) * 60; // 45 degree, +0.5 to get to center

      // Connections to adapter:
      const gap = 60 / n;
      const topConnectionY = midY - 30 + gap / 2;
      const connectionY = topConnectionY + i * gap;
      const cornerX = 30 + height * 60;
      const cornerY = connectionY - y;
      return { order, x, y, cornerX, cornerY };
    });

const getSources = (n: number, gridWidth: number): Source[] =>
  getTerminals(gridWidth, n).map(({ order, x, y, cornerX, cornerY }) => ({
    type: Object.values(SourceType)[
      mapIndex(order, gridWidth * 2, Object.values(SourceType).length)
    ],
    active: false,
    x,
    y,
    translate: `translate(${x}, ${y})`,
    path: `M 30 0 L ${cornerX} ${cornerY} H ${gridWidth * 60 - x}`,
  }));

const getSinks = (n: number, gridWidth: number): Sink[] =>
  getTerminals(gridWidth, n).map(({ order, x, y, cornerX, cornerY }) => {
    const reflectedX = (gridWidth * 2 + 2) * 60 - x;
    return {
      type: Object.values(SinkType)[
        mapIndex(order, gridWidth * 2, Object.values(SinkType).length)
      ],
      active: false,
      x,
      y,
      translate: `translate(${reflectedX}, ${y})`,
      path: `M -30 0 L ${-cornerX} ${cornerY} H ${-(gridWidth * 60 - x)}`,
    };
  });

@Component({
  standalone: true,
  selector: 'state-adapt-circuits',
  imports: [CommonModule],
  templateUrl: './circuits.component.html',
  styleUrls: ['./circuits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircuitsComponent implements OnInit {
  ww = (window as any).innerWidth;
  @Input() n = this.ww < 550 ? 6 : this.ww < 1000 ? 10 : this.ww < 1900 ? 15 : 22;
  circuits!: Circuit[];

  constructor(private zone: NgZone) {}

  ngOnInit() {
    this.circuits = new Array(this.n).fill(0).map((z, i) => {
      const nSources = getNumberBetween(2, 5);
      const nSinks = getNumberBetween(2, 5);
      return {
        i,
        sources: getSources(nSources, 6),
        sinks: getSinks(nSinks, 6),
      };
    });

    (window as any).MOARRR = () =>
      this.zone.runOutsideAngular(() => this.makeCircuitsFire());
    (window as any).MOARRR();
  }

  private makeCircuitsFire() {
    const dashDt = 1500;
    const startSource = 0;
    const endSource = startSource + dashDt;
    const startAdapter = 400;
    const endAdapter = 600;
    const startSink = 500;
    const endSink = startSink + dashDt;
    waitRandom(500, 3000, () => {
      const sourceGroups = Array.from(document.querySelectorAll('.source'));
      if (!sourceGroups.length) return;
      const sourceGroup = getRandomEl(sourceGroups).el;
      const sourceParent = sourceGroup.parentNode as SVGAElement;
      const sourcePulse = sourceGroup.querySelector(
        '.connector-pulse path',
      ) as SVGAElement;
      const adapter = sourceParent.querySelector('.adapter') as SVGAElement;
      const sinkGroups = Array.from(sourceParent.querySelectorAll('.sink')).map(child =>
        child.querySelector('.connector-pulse path'),
      ) as SVGAElement[];

      (
        [
          [startSource, () => this.activate(sourcePulse)],
          [endSource, () => this.deactivate(sourcePulse)],
          [startAdapter, () => this.activate(adapter)],
          [endAdapter, () => this.deactivate(adapter)],
          [
            startSink,
            () =>
              sinkGroups.forEach(child => Math.random() < 0.6 && this.activate(child)),
          ],
          [endSink, () => sinkGroups.forEach(child => this.deactivate(child))],
        ] as [number, any][]
      ).forEach(([t, fn]) => setTimeout(fn, t));
    });
  }

  private activate(el: SVGAElement) {
    el.className.baseVal = el.className.baseVal + ' active';
  }
  private deactivate(el: SVGAElement) {
    el.className.baseVal = el.className.baseVal.replace(/(\s*)active/, '');
  }
}
