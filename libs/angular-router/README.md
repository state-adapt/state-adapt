# @state-adapt/angular-router

Angular Router integration for StateAdapt.

## Getting Started

<!-- #region getting-started -->

With Angular Router already set up, install the optional navigation component:

```sh
npm install @state-adapt/angular-router
```

Import `SaNavigateComponent` from `@state-adapt/angular-router` into the standalone
component that will use it, then bind a URL in the template:

```html
<sa-navigate [url]="targetUrl"></sa-navigate>
```

When the input changes to a nonempty URL, the component asks Angular Router to
navigate to it. A null input leaves the current route unchanged.

<!-- #endregion getting-started -->
