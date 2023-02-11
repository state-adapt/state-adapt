import { ActivatedRoute, Router } from '@angular/router';
import { defer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

export function setUpFramework(activatedRoute: ActivatedRoute, router: Router) {
  const storedFramework = localStorage.getItem('framework');
  const routeFramework = activatedRoute.snapshot.paramMap
    .get('framework')
    ?.replace(/#.*/g, '');
  const framework = routeFramework || storedFramework || 'angular';

  if (!routeFramework) {
    router.navigate([`/${framework}`], { replaceUrl: true });
  }
  if (framework !== storedFramework) {
    localStorage.setItem('framework', framework);
  }

  return defer(() => {
    return activatedRoute.params.pipe(
      startWith({ framework }),
      switchMap((params: Record<string, any>) => {
        const framework = params.framework;
        if (!framework) return Promise.resolve('');
        localStorage.setItem('framework', framework);
        return import(`./progressive-examples/${framework}.md`).then(
          m => m.default,
        );
      }),
    );
  });
}
