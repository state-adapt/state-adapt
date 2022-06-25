import { Component, Input, OnInit } from '@angular/core';
import { AdaptCommon, Source, toSource } from '../../../../libs/core/src';
import { TileSelection } from 'carbon-components-angular';
import { combineLatest, Subject } from 'rxjs';
import {
  debounceTime,
  delay,
  first,
  map,
  mapTo,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { initialState } from './adapter-docs-state.interface';
import { AdapterDocs, defaultAdapterDocs } from './adapter-docs.interface';
import { docsAdapter, docsUiAdapter } from './docs.adapter';
import { DropdownSelectedEvent } from './dropdown-selection-event.interface';
import { getDiffHtml, toJson } from './get-diff-html.function';

@Component({
  selector: 'state-adapt-adapter-docs',
  template: `
    <ng-container *ngIf="docs$ | async; let docs">
      <h1 class="adapter-creator-name">
        <code>{{ docs.name }}</code>
      </h1>

      <markdown [data]="docs.description"></markdown>

      <ibm-structured-list [condensed]="true" *ngIf="docs.parameters.length">
        <ibm-list-header>
          <ibm-list-column>Parameter</ibm-list-column>
          <ibm-list-column>Description</ibm-list-column>
        </ibm-list-header>
        <ibm-list-row *ngFor="let param of docs.parameters">
          <ibm-list-column>
            <code>{{ param.text }}</code>
          </ibm-list-column>
          <ibm-list-column>
            <!-- {{ param.description }} -->
            <markdown [data]="param.description"></markdown>
          </ibm-list-column>
        </ibm-list-row>
      </ibm-structured-list>

      <h2>Source Code</h2>
      <markdown [data]="creatorSourceCodeMd$ | async"></markdown>

      <h2>Demo</h2>
      <markdown [data]="demoSourceCodeMd$ | async"></markdown>
      <ng-template #codeTemplate let-item="item">
        <code style="color: #f4f4f4">{{ item?.content }}</code>
      </ng-template>

      <div class="history">
        <ibm-tile-group (selected)="historyItemSelected$.next($event)">
          <ibm-selection-tile
            *ngFor="let item of demoHistory$ | async; let i = index"
            [value]="i.toString()"
            [selected]="item.selected"
          >
            <code>{{ item.inputs.stateChangeName }}</code>
          </ibm-selection-tile>
        </ibm-tile-group>
      </div>

      <ibm-tile class="state-change-panel">
        <div class="dropdown-header">
          <ibm-dropdown
            [dropUp]="false"
            placeholder="State Change"
            [displayValue]="codeTemplate"
            (selected)="stateChangeSelection$.next($any($event))"
          >
            <ibm-dropdown-list
              [items]="stateChangeItems$ | async"
              [listTpl]="codeTemplate"
            ></ibm-dropdown-list>
          </ibm-dropdown>
        </div>
        <ibm-tabs>
          <ibm-tab heading="Payload">
            <!-- <div
              class="editor-placeholder"
              *ngIf="payloadEditorRefreshRequired$ | async"
            ></div> -->
            <ngs-code-editor
              *ngIf="(payloadEditorRefreshRequired$ | async) === false"
              theme="vs-dark"
              [codeModel]="codeModel$ | async"
              [options]="codeOptions"
              (keypress)="editorKeyPressed$.next()"
              (valueChanged)="payloadChanged$.next($event)"
            ></ngs-code-editor>
          </ibm-tab>
          <ibm-tab class="padded" heading="Documentation">
            {{ (selectedStateChange$ | async)?.documentation }}
          </ibm-tab>
        </ibm-tabs>
        <button
          ibmButton="primary"
          (click)="executeClicked$.next()"
          [disabled]="selectedHistoryItem$ | async"
        >
          Execute
        </button>
      </ibm-tile>

      <ibm-tile class="selector-panel">
        <div class="dropdown-header">
          <ibm-dropdown
            [dropUp]="false"
            placeholder="Selector"
            [displayValue]="codeTemplate"
            (selected)="selectorSelection$.next($any($event))"
          >
            <ibm-dropdown-list
              [items]="selectorItems$ | async"
              [listTpl]="codeTemplate"
            ></ibm-dropdown-list>
          </ibm-dropdown>
        </div>
        <ibm-tabs>
          <ibm-tab heading="Result">
            <markdown [data]="selectorResult$ | async"></markdown>
            <!-- <pre class="language-json">{{ selectorResult$ | async }}</pre> -->
          </ibm-tab>
          <ibm-tab heading="Diff">
            <pre class="language-json" [innerHTML]="selectorDiff$ | async"></pre>
          </ibm-tab>
          <ibm-tab class="padded" heading="Documentation">
            {{ (selectedSelector$ | async)?.documentation }}
          </ibm-tab>
        </ibm-tabs>
      </ibm-tile>
    </ng-container>
  `,
  styles: [
    `
      .adapter-creator-name code {
        margin-left: -5px;
      }
      ::ng-deep ibm-list-column p {
        margin: 0;
        font-size: 1em;
      }
      ::ng-deep section.bx--structured-list {
        margin-bottom: 0;
        margin-bottom: 1.6rem;
        margin-top: 0.8rem;
      }

      ibm-tile {
        padding: 0;
      }
      .history,
      .state-change-panel {
        margin-top: 0.5em !important;
      }
      .history {
        width: 100px;
        float: left !important;
      }
      @media screen and (min-width: 1500px) {
        ::ng-deep .history {
          margin-left: -200px;
          width: 200px !important;
        }
        ::ng-deep .state-change-panel {
          margin-left: calc(12px - 200px) !important;
          width: calc(100% + 0px - 12px) !important;
        }
        ::ng-deep .selector-panel {
          width: calc(100% + 0px - 12px) !important;
        }
        ::ng-deep .history ibm-selection-tile code {
          width: calc(200px - 30px) !important;
        }
      }
      ::ng-deep .history ibm-selection-tile label {
        padding: 1rem !important;
        min-height: 0 !important;
        margin-bottom: 4px !important;
        min-width: 0;
      }
      ::ng-deep .history ibm-selection-tile code {
        width: 70px;
        overflow: hidden;
        display: block;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .state-change-panel {
        margin: 0px 0 20px 12px;
        width: calc(100% - 100px - 12px);
        float: right;
      }
      .selector-panel {
        margin: 0 0 2.5rem 0;
        width: calc(100% - 100px - 12px);
        float: right;
      }
      .dropdown-header {
        display: flex;
        align-items: stretch;
      }
      .dropdown-header-label {
        width: 50%;
        display: flex;
        align-items: center;
        margin-top: 0;
        border-bottom: 1px solid #8d8d8d;
      }
      /* .dropdown {
        width: 66.7%;
      } */
      ibm-dropdown {
        display: block;
        width: 50%;
        width: 100%;
      }
      ibm-tabs {
        width: 100%;
      }
      ::ng-deep .state-change-panel ibm-tab .bx--tab-content {
        height: 160px;
        padding: 0;
        background-color: #1e1e1e;
        border-left: 2px solid #00b8a4;
      }
      ::ng-deep ibm-tab.padded .bx--tab-content {
        padding: 1em !important;
      }
      ::ng-deep .bx--tabs--scrollable__nav,
      ::ng-deep .bx--tabs--scrollable__nav-item,
      ::ng-deep .bx--tabs--scrollable__nav-link {
        width: 100% !important;
      }
      ::ng-deep #editor {
        min-height: 160px !important;
      }
      .editor-placeholder {
        min-height: 160px;
        width: 100%;
        background-color: #1e1e1e;
      }
      ::ng-deep .state-change-panel button {
        width: 33.333%;
      }
      ::ng-deep .selector-panel ibm-tab .bx--tab-content {
        height: 300px;
        padding: 0;
        background-color: #1e1e1e;
        border-left: 2px solid #00b8a4;
      }
      ::ng-deep .selector-panel ibm-tab pre {
        height: 300px;
        margin: 0;
        overflow-x: auto;
        white-space: pre-wrap;
        font-size: 12px;
        border-left-width: 0px;
      }
    `,
  ],
})
export class AdapterDocsComponent implements OnInit {
  @Input() adapterDocs: AdapterDocs = defaultAdapterDocs;
  path = ('adapterDocs' + Math.random()).replace('.', '');

  detachedDocsStore = this.adapt.spy(this.path, docsAdapter);

  docsInputValue$ = new Subject<AdapterDocs>();
  docsReceived$ = this.docsInputValue$.pipe(toSource('docsReceived$'));
  stateChangeSelection$ = new Source<DropdownSelectedEvent>('stateChangeSelection$');
  stateChangePayloadDelay$ = this.detachedDocsStore.selectedStateChange$.pipe(
    delay(100),
    mapTo(undefined),
    toSource('stateChangePayloadDelay$'),
  );
  selectorSelection$ = new Source<DropdownSelectedEvent>('selectorSelection$');
  payloadChanged$ = new Source<string>('payloadChanged$');
  // Editor emits when it receives a new value
  // So only listen to it right after a key press
  editorKeyPressed$ = new Subject<void>();
  payloadChangedDebounced$ = this.editorKeyPressed$.pipe(
    switchMap(() => this.payloadChanged$.pipe(first())),
    debounceTime(500),
  );
  executeClicked$ = new Subject<void>();
  demoAdapterValue$ = this.docsInputValue$.pipe(map(docs => docs.demoAdapter.value));
  newStateCalculated$ = this.executeClicked$.pipe(
    switchMap(() => this.detachedDocsStore.demoStateAndPayload$.pipe(first())),
    withLatestFrom(this.demoAdapterValue$),
    map(([{ state, payload, initialState, stateChangeName }, demoAdapter]) =>
      demoAdapter[stateChangeName](state, JSON.parse(payload), initialState),
    ),
    toSource('newStateCalculated$'),
  );
  historyItemSelected$ = new Source<TileSelection>('historyItemSelected$');

  docsStore = this.adapt.init([this.path, initialState, docsUiAdapter], {
    receiveDocs: this.docsReceived$,
    selectStateChange: this.stateChangeSelection$,
    selectStateChangeFromHistory: this.historyItemSelected$,
    resetEditorRefresh: this.stateChangePayloadDelay$,
    setPayload: this.payloadChangedDebounced$,
    setDemoState: this.newStateCalculated$,
    selectHistoryItem: [
      this.historyItemSelected$,
      this.payloadChangedDebounced$,
      this.stateChangeSelection$,
    ],
    selectSelector: this.selectorSelection$,
  });

  docs$ = this.docsStore.docs$;
  creatorSourceCodeMd$ = this.docsStore.creatorSourceCodeMd$;
  demoSourceCodeMd$ = this.docsStore.demoSourceCodeMd$;
  paramters$ = this.docsStore.parameters$;
  stateChangeItems$ = this.docsStore.adapterStateChangeItems$;
  selectorItems$ = this.docsStore.adapterSelectorItems$;
  selectedStateChange$ = this.docsStore.selectedStateChange$;
  payloadEditorRefreshRequired$ = this.docsStore.payloadEditorRefreshRequired$;
  codeModel$ = this.docsStore.payloadCodeModel$;
  codeOptions = {
    contextMenu: true,
    scrollBeyondLastLine: false,
  };
  demoHistory$ = this.docsStore.demoHistory$;
  selectedHistoryItem$ = this.docsStore.selectedHistoryItem$;
  diffStateAndSelectorName$ = this.docsStore.diffStateAndSelectorName$;
  selectedSelector$ = this.docsStore.selectedSelector$;
  selectorResult$ = combineLatest([
    this.demoAdapterValue$,
    this.diffStateAndSelectorName$,
  ]).pipe(
    map(
      ([adapter, [diff, selectorName]]) =>
        '```json\n' +
        toJson((adapter.selectors || {})[selectorName]?.(diff[1]) || diff[1]) +
        '\n```',
    ),
  );
  selectorDiff$ = combineLatest([
    this.demoAdapterValue$,
    this.diffStateAndSelectorName$,
  ]).pipe(
    map(([adapter, [diff, selectorName]]) => {
      const selector = (adapter.selectors || {})[selectorName] || this.getState;
      const selectorDiff = diff.map(selector) as [any, any];
      return getDiffHtml(...selectorDiff);
    }),
  );

  constructor(private adapt: AdaptCommon<any>) {}

  ngOnInit() {
    setTimeout(() => this.docsInputValue$.next(this.adapterDocs));
    this.payloadChanged$.subscribe(a => console.log('a', a));
  }

  getState(state: any) {
    return state;
  }
}
