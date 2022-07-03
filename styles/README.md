## Theme CSS Variables

Import `theme-css-vars` once per app. CSS variables become globally available.

## Custom, Global Styles

Create a file in this folder for each global feature/component with custom styles that extend a carbon component or needs to be used in markdown.

Import component/feature styles only once per app. These global styles would be great as components, but they might be used in markdown, or they extend styles that are provided by Carbon.

## Carbon SASS Variables

Import `carbon-sass-vars.scss` before any feature/component imports. `carbon-sass-vars.scss` defines SASS variables that are used in the carbon components styles.

## Example:

### In `apps/<app_name>/src/styles.scss`

Import for whole app:

```scss
@import '../../../styles/theme-css-vars';
```

Import to prepare to import carbon component style and custom style imports:

```scss
@import '../../../styles/carbon-sass-vars';
```

Now import carbon components that are needed on the home page:

```scss
@import '~carbon-components/scss/components/button/button';
@import '~carbon-components/scss/components/list/list';
```

Import custom styles that are needed on the home page:

```scss
@import '../../../styles/ui-shell';
```

### In lazy-loaded feature

Now in a lazy-loaded component with ViewEncapsulation.None, import styles that will only be imported in this one place on behalf of the entire app:

```scss
@import '../../../styles/carbon-sass-vars';
@import '../../../styles/code-snippet-theme';
```

Good luck. You might need to do weird things with routes, or find a way to create components containing these styles that can be imported multiple times.

## Future Ideas

Create a standalone component like this:

```typescript
@Component({
  selector: 'state-adapt-global-list-styles',
  encapsulation: ViewEncapsulation.None,
  template: '',
  styleUrls: ['state-adapt-global-list-styles.scss'],
})
export class GlobalListStylesComponent {}
```

And then in any component that depends on these styles, just have `<state-adapt-global-list-styles></state-adapt-global-list-styles>` at the top.
