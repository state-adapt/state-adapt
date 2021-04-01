import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

export function getMarkedOptions(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.list = (text: string, ordered: boolean) =>
    `<ul class="bx--list--unordered">${text}</ul>`;
  renderer.listitem = (text: string) =>
    `<li class="bx--list__item">${text}</li>`;
  // renderer.heading = (text: string, level: number) => text;

  return { renderer };
}
