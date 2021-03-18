import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AdaptState } from './adapt.state';
import { PatchState } from '@state-adapt/core';

export function actionSanitizer(action) {
  return {
    ...action,
    type:
      action.type === PatchState.type
        ? `[${action.type}] [${action.actionType}]`
        : action.type,
  };
}

@NgModule({
  imports: [NgxsModule.forFeature([AdaptState])],
})
export class AdaptModule {}
