import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { VisitActions } from './visit.actions';
import { VisitDataService } from '../../Services/visits-data.service';

export interface VisitStateModel<T = any> {
  entities: Record<number, T>;
  ids: number[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // ms
}

@State<VisitStateModel>({
  name: 'visits',
  defaults: { entities: {}, ids: [], loading: false, error: null, lastFetched: null }
})
@Injectable()
export class VisitState {

  constructor(private api: VisitDataService) {}

  // --------- Selectors ----------
  @Selector() static selectAll(s: VisitStateModel) { return s.ids.map(id => s.entities[id]); }
  @Selector() static loading(s: VisitStateModel)   { return s.loading; }
  @Selector() static error(s: VisitStateModel)     { return s.error; }
  @Selector() static total(s: VisitStateModel)     { return s.ids.length; }
  @Selector() static byId(s: VisitStateModel)      { return (id: number) => s.entities[id]; }

  // --------- Helpers ----------
  private idKey() { return 'visitID'; }
  private setLoading(ctx: StateContext<VisitStateModel>, v: boolean) {
    ctx.patchState({ loading: v, error: null });
  }
  private setError(ctx: StateContext<VisitStateModel>, msg: string) {
    ctx.patchState({ loading: false, error: msg });
  }
  private upsertMany(ctx: StateContext<VisitStateModel>, rows: any[]) {
    const s = ctx.getState();
    const entities = { ...s.entities };
    const ids = new Set<number>(s.ids);
    const key = this.idKey();
    for (const r of rows || []) {
      const id = Number(r?.[key]);
      if (!isFinite(id)) { continue; }
      entities[id] = r;
      ids.add(id);
    }
    ctx.patchState({ entities, ids: Array.from(ids), lastFetched: Date.now() });
  }
  private upsertOne(ctx: StateContext<VisitStateModel>, row: any) {
    this.upsertMany(ctx, [row]);
  }
  private removeOne(ctx: StateContext<VisitStateModel>, id: number) {
    const s = ctx.getState();
    const entities = { ...s.entities };
    delete entities[id];
    ctx.patchState({ entities, ids: s.ids.filter(x => x !== id), loading: false });
  }
  private shouldUseCache(s: VisitStateModel, force: boolean) {
    if (force) return false;
    if (!s.lastFetched) return false;
    return (Date.now() - s.lastFetched) < 2 * 60 * 1000; // 2 min
  }

  // --------- Actions ----------
  @Action(VisitActions.LoadAll)
  loadAll(ctx: StateContext<VisitStateModel>, { force }: VisitActions.LoadAll) {
    const s = ctx.getState();
    if (this.shouldUseCache(s, force)) return of(null);
    this.setLoading(ctx, true);
    const call = this.api.getAllVisits ? this.api.getAllVisits() : null;
    if (!call) { this.setError(ctx, 'No getAllVisits() method found'); return of(null); }
    return call.pipe(
      tap((rows: any[]) => { this.upsertMany(ctx, rows ?? []); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to load visits'); return of(null); })
    );
  }

  @Action(VisitActions.LoadById)
  loadById(ctx: StateContext<VisitStateModel>, { id }: VisitActions.LoadById) {
    this.setLoading(ctx, true);
    const call = this.api.getVisitById ? this.api.getVisitById(id) : null;
    if (!call) { this.setError(ctx, 'No getVisitById() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { if (row) this.upsertOne(ctx, row); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to load visit'); return of(null); })
    );
  }

  @Action(VisitActions.Create)
  create(ctx: StateContext<VisitStateModel>, { payload }: VisitActions.Create) {
    this.setLoading(ctx, true);
    const call = this.api.addVisit ? this.api.addVisit(payload) : null;
    if (!call) { this.setError(ctx, 'No addVisit() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { if (row) this.upsertOne(ctx, row); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to create visit'); return of(null); })
    );
  }

  @Action(VisitActions.Update)
  update(ctx: StateContext<VisitStateModel>, { payload }: VisitActions.Update) {
    this.setLoading(ctx, true);
    const key = this.idKey();
    const id  = (payload && (payload[key] ?? payload.id ?? payload.ID)) as number;
    const call = this.api.updateVisit ? this.api.updateVisit(id, payload) : null;
    if (!call) { this.setError(ctx, 'No updateVisit() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { this.upsertOne(ctx, row ?? payload); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to update visit'); return of(null); })
    );
  }

  @Action(VisitActions.Delete)
  delete(ctx: StateContext<VisitStateModel>, { id }: VisitActions.Delete) {
    this.setLoading(ctx, true);
    const call = this.api.deleteVisit ? this.api.deleteVisit(id) : null;
    if (!call) { this.setError(ctx, 'No deleteVisit() method found'); return of(null); }
    return call.pipe(
      tap(() => { this.removeOne(ctx, id); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to delete visit'); return of(null); })
    );
  }
}
