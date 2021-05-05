import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

export function getMarkedOptions(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.list = (text: string, ordered: boolean, ...rest) => {
    const isNested = text.includes('[nested]');
    const orderedClassName = ordered ? 'ordered' : 'unordered';
    const className = isNested ? 'nested' : orderedClassName;
    return `<ul class="bx--list--${className}">${text.replace(
      '[nested]',
      '',
    )}</ul>`;
  };
  renderer.listitem = (text: string) =>
    `<li class="bx--list__item">${text}</li>`;
  // renderer.heading = (text: string, level: number) => text;

  return { renderer };
}
