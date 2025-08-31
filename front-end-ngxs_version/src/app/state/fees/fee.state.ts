// Auto-generated NGXS scaffolding (beginner-friendly). Keep logic simple.
import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FeeActions } from './fee.actions';
import { FeeDataService } from '../../Services/fee-data.service';

export interface FeeStateModel {
  data: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

@State<FeeStateModel>({
  name: 'fees',
  defaults: { data: [], loading: false, error: null, lastFetched: null }
})
@Injectable()
export class FeeState {
  constructor(private feeApi: FeeDataService) { }

  @Selector() static data(s: FeeStateModel) { return s.data; }
  @Selector() static loading(s: FeeStateModel) { return s.loading; }
  @Selector() static error(s: FeeStateModel) { return s.error; }

  private shouldUseCache(s: FeeStateModel, force: boolean) {
    if (force) return false;
    if (!s.lastFetched) return false;
    return Date.now() - s.lastFetched < 2 * 60 * 1000;
  }

  @Action(FeeActions.LoadAll)
  loadAll(ctx: StateContext<FeeStateModel>, { force }: FeeActions.LoadAll) {
    const s = ctx.getState();
    if (this.shouldUseCache(s, force)) return of(null);
    ctx.patchState({ loading: true, error: null });
    // Placeholder (add real API when available):
    return of([]).pipe(
      tap((rows: any[]) => ctx.patchState({ data: rows, loading: false, lastFetched: Date.now() })),
      catchError(err => { ctx.patchState({ loading: false, error: err?.message ?? 'Failed to load fees' }); return of(null); })
    );
  }
}
