import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EditorReadyService {
  ready$ = new BehaviorSubject(false);
}
