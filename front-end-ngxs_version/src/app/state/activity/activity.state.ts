// Auto-generated NGXS scaffolding (beginner-friendly). Keep logic simple.
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ActivityActions } from './activity.actions';

export interface ActivityStateModel {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

@State<ActivityStateModel>({
  name: 'activity',
  defaults: { data: [], loading: false, error: null, lastFetched: null }
})
@Injectable()
export class ActivityLogState {
  @Selector() static data(s: ActivityStateModel) { return s.data; }
  @Selector() static loading(s: ActivityStateModel) { return s.loading; }
  @Selector() static error(s: ActivityStateModel) { return s.error; }

  private shouldUseCache(s: ActivityStateModel, force: boolean) {
    if (force) return false;
    if (!s.lastFetched) return false;
    return Date.now() - s.lastFetched < 2 * 60 * 1000;
  }

  @Action(ActivityActions.LoadAll)
  loadAll(ctx: StateContext<ActivityStateModel>, { force }: ActivityActions.LoadAll) {
    const s = ctx.getState();
    if (this.shouldUseCache(s, force)) return of(null);
    ctx.patchState({ loading: true, error: null });
    // Placeholder: wire actual API when available
    return of([]).pipe(
      tap((rows: any[]) => ctx.patchState({ data: rows, loading: false, lastFetched: Date.now() })),
      catchError(err => { ctx.patchState({ loading: false, error: err?.message ?? 'Failed to load activity' }); return of(null); })
    );
  }
}
