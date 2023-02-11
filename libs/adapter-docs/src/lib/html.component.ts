import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'sa-html',
  template: `
    <div #mdContainer [innerHTML]="_html"></div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlComponent implements AfterViewChecked {
  sanitizer = inject(DomSanitizer);
  _html: any;
  newHtml = false;
  @Input() set html(html: string) {
    this._html = this.sanitizer.bypassSecurityTrustHtml(html);
    this.newHtml = true;
  }
  @ViewChild('mdContainer') mdContainer: any;
  // ngAfterViewInit() {
  //   this.parseHtml();
  // }

  ngAfterViewChecked() {
    if (this.newHtml) {
      this.parseHtml();
      this.newHtml = false;
    }
  }

  parseHtml() {
    const el = this.mdContainer.nativeElement || document;
    el.querySelectorAll('pre').forEach(
      (block: any) =>
        !block.className.includes('language-') && block.classList.add('language-none'),
    );
    (window as any).Prism?.highlightAllUnder?.(el);
  }
}
