import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DoctorActions } from './doctor.actions';
import { DoctorDataService } from '../../Services/doctor-data.service';

export interface DoctorStateModel<T = any> {
  entities: Record<number, T>;
  ids: number[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

@State<DoctorStateModel>({
  name: 'doctors',
  defaults: { entities: {}, ids: [], loading: false, error: null, lastFetched: null }
})
@Injectable()
export class DoctorState {
  constructor(private api: DoctorDataService) {}

  @Selector() static selectAll(s: DoctorStateModel) { 
    return s.ids.map(id => s.entities[id]); 
  }
  @Selector() static loading(s: DoctorStateModel){ 
    return s.loading; 
  }
  @Selector() static error(s: DoctorStateModel){ 
    return s.error; 
  }
  @Selector() static total(s: DoctorStateModel){ 
    return s.ids.length;
   }

  private idKey() { return 'doctorID'; }
  private setLoading(ctx: StateContext<DoctorStateModel>, v: boolean) {
     ctx.patchState({ loading: v, error: null }); 
    }
  private setError(ctx: StateContext<DoctorStateModel>, msg: string)  { 
    ctx.patchState({ loading: false, error: msg }); 
  }
  private upsertMany(ctx: StateContext<DoctorStateModel>, rows: any[]) {
    const s = ctx.getState();
    const entities = { ...s.entities };
    const ids = new Set<number>(s.ids);
    const key = this.idKey();
    for (const r of rows || []) {
      const id = Number(r?.[key]); 
      if (!isFinite(id)) {
        continue;
      }
      entities[id] = r; ids.add(id);
    }
    ctx.patchState({ entities, ids: Array.from(ids), lastFetched: Date.now() });
  }


  private upsertOne(ctx: StateContext<DoctorStateModel>, row: any) { 
    this.upsertMany(ctx, [row]); 
  }


  private removeOne(ctx: StateContext<DoctorStateModel>, id: number) {
    const s = ctx.getState(); const entities = { ...s.entities }; delete entities[id];
    ctx.patchState({ entities, ids: s.ids.filter(x => x !== id), loading: false });
  }


  private shouldUseCache(s: DoctorStateModel, force: boolean) { 
    return !force && !!s.lastFetched && (Date.now() - s.lastFetched) < 120000; 
  }

  @Action(DoctorActions.LoadAll)
  loadAll(ctx: StateContext<DoctorStateModel>, { force }: DoctorActions.LoadAll) {
    const s = ctx.getState(); if (this.shouldUseCache(s, force)) return of(null);
    this.setLoading(ctx, true);
    const call = this.api.getAllDoctors ? this.api.getAllDoctors() : null;
    if (!call) { this.setError(ctx, 'No getAllDoctors() method found'); return of(null); }
    return call.pipe(
      tap((rows: any[]) => { this.upsertMany(ctx, rows ?? []); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to load doctors'); return of(null); })
    );
  }

  @Action(DoctorActions.LoadById)
  loadById(ctx: StateContext<DoctorStateModel>, { id }: DoctorActions.LoadById) {
    this.setLoading(ctx, true);
    const call = this.api.getDoctorByID ? this.api.getDoctorByID(id) : null;
    if (!call) { this.setError(ctx, 'No getDoctorByID() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { if (row) this.upsertOne(ctx, row); 
        this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to load doctor'); 
        return of(null); })
    );
  }

  @Action(DoctorActions.Create)
  create(ctx: StateContext<DoctorStateModel>, { payload }: DoctorActions.Create) {
    this.setLoading(ctx, true);
    const call = this.api.AddNewDoctor ? this.api.AddNewDoctor(payload) : null;
    if (!call) { this.setError(ctx, 'No AddNewDoctor() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { if (row) this.upsertOne(ctx, row); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to create doctor'); return of(null); })
    );
  }

  @Action(DoctorActions.Update)
  update(ctx: StateContext<DoctorStateModel>, { payload }: DoctorActions.Update) {
    this.setLoading(ctx, true);
    const id = payload?.[this.idKey()] ?? payload?.id ?? payload?.ID;
    const call = this.api.UpdateDoctor ? this.api.UpdateDoctor(id, payload) : null;
    if (!call) { this.setError(ctx, 'No UpdateDoctor() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { this.upsertOne(ctx, row ?? payload); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to update doctor'); return of(null); })
    );
  }

  @Action(DoctorActions.Delete)
  delete(ctx: StateContext<DoctorStateModel>, { id }: DoctorActions.Delete) {
    this.setLoading(ctx, true);
    const call = this.api.deleteDoctorByID ? this.api.deleteDoctorByID(id) : null;
    if (!call) { this.setError(ctx, 'No deleteDoctorByID() method found'); return of(null); }
    return call.pipe(
      tap(() => this.removeOne(ctx, id)),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to delete doctor'); return of(null); })
    );
  }
}
