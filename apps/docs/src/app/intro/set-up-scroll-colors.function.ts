// Experimenting with violating separation of concerns for partial Qwik-like benefits
// This probably saves like 650 bytes of download on initial load
export function setUpScrollColors(component: any) {
  const set = (mono: boolean) =>
    (component.frameworksMono = component.featuresMono = mono);

  setTimeout(() => set(false), 1_000);

  window.addEventListener('scroll', () => {
    if (component.monoTimeout) {
      clearTimeout(component.monoTimeout);
    }
    set(true);
    component.monoTimeout = setTimeout(() => set(false), 300);
  });
}
