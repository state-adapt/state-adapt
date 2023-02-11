import { ActivatedRoute, Router } from '@angular/router';
import { defer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

export function setUpFramework(activatedRoute: ActivatedRoute, router: Router) {
  const storedFramework = localStorage.getItem('framework');
  const routeFramework = activatedRoute.snapshot.paramMap
    .get('framework')
    ?.replace(/#.*/g, '');
  const framework = routeFramework || storedFramework || 'angular';
  const definedFramework =
    framework && framework !== 'null' ? framework : 'angular';

  if (!routeFramework) {
    router.navigate([`/${definedFramework}`], { replaceUrl: true });
  }
  if (definedFramework !== storedFramework) {
    localStorage.setItem('framework', definedFramework);
  }

  return defer(() => {
    return activatedRoute.params.pipe(
      startWith({ framework }),
      switchMap((params: Record<string, any>) => {
        const framework = params.framework;
        const definedFramework =
          framework && framework !== 'null' ? framework : 'angular';
        localStorage.setItem('framework', definedFramework);
        return import(`./progressive-examples/${definedFramework}.md`).then(
          m => m.default,
        );
      }),
    );
  });
}
