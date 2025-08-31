import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PatientActions } from './patient.actions';
import { PatientDataService } from '../../Services/patient-data.service';

export interface PatientStateModel<T = any> {
  entities: Record<number, T>;
  ids: number[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

@State<PatientStateModel>({
  name: 'patients',
  defaults: { entities: {}, ids: [], loading: false, error: null, lastFetched: null }
})
@Injectable()
export class PatientState {
  constructor(private api: PatientDataService) {}

  @Selector() static selectAll(s: PatientStateModel) { return s.ids.map(id => s.entities[id]); }
  @Selector() static loading(s: PatientStateModel)   { return s.loading; }
  @Selector() static error(s: PatientStateModel)     { return s.error; }
  @Selector() static total(s: PatientStateModel)     { return s.ids.length; }

  private idKey() { return 'patientID'; }
  private setLoading(ctx: StateContext<PatientStateModel>, v: boolean) { ctx.patchState({ loading: v, error: null }); }
  private setError(ctx: StateContext<PatientStateModel>, msg: string)  { ctx.patchState({ loading: false, error: msg }); }
  private upsertMany(ctx: StateContext<PatientStateModel>, rows: any[]) {
    const s = ctx.getState();
    const entities = { ...s.entities };
    const ids = new Set<number>(s.ids);
    const key = this.idKey();
    for (const r of rows || []) {
      const id = Number(r?.[key]); if (!isFinite(id)) continue;
      entities[id] = r; ids.add(id);
    }
    ctx.patchState({ entities, ids: Array.from(ids), lastFetched: Date.now() });
  }
  private upsertOne(ctx: StateContext<PatientStateModel>, row: any) { this.upsertMany(ctx, [row]); }
  private removeOne(ctx: StateContext<PatientStateModel>, id: number) {
    const s = ctx.getState(); const entities = { ...s.entities }; delete entities[id];
    ctx.patchState({ entities, ids: s.ids.filter(x => x !== id), loading: false });
  }
  private shouldUseCache(s: PatientStateModel, force: boolean) { return !force && !!s.lastFetched && (Date.now() - s.lastFetched) < 120000; }

  @Action(PatientActions.LoadAll)
  loadAll(ctx: StateContext<PatientStateModel>, { force }: PatientActions.LoadAll) {
    const s = ctx.getState(); if (this.shouldUseCache(s, force)) return of(null);
    this.setLoading(ctx, true);
    const call = this.api.getAllPatients ? this.api.getAllPatients() : null;
    if (!call) { this.setError(ctx, 'No getAllPatients() method found'); return of(null); }
    return call.pipe(
      tap((rows: any[]) => { this.upsertMany(ctx, rows ?? []); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to load patients'); return of(null); })
    );
  }

  @Action(PatientActions.LoadById)
  loadById(ctx: StateContext<PatientStateModel>, { id }: PatientActions.LoadById) {
    this.setLoading(ctx, true);
    const call = this.api.getPatientByID ? this.api.getPatientByID(id) : null;
    if (!call) { this.setError(ctx, 'No getPatientByID() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { if (row) this.upsertOne(ctx, row); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to load patient'); return of(null); })
    );
  }

  @Action(PatientActions.Create)
  create(ctx: StateContext<PatientStateModel>, { payload }: PatientActions.Create) {
    this.setLoading(ctx, true);
    const call = this.api.AddNewPatient ? this.api.AddNewPatient(payload) : null;
    if (!call) { this.setError(ctx, 'No AddNewPatient() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { if (row) this.upsertOne(ctx, row); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to create patient'); return of(null); })
    );
  }

  @Action(PatientActions.Update)
  update(ctx: StateContext<PatientStateModel>, { payload }: PatientActions.Update) {
    this.setLoading(ctx, true);
    const id = payload?.[this.idKey()] ?? payload?.id ?? payload?.ID;
    const call = this.api.UpdatePatient ? this.api.UpdatePatient(id, payload) : null;
    if (!call) { this.setError(ctx, 'No UpdatePatient() method found'); return of(null); }
    return call.pipe(
      tap((row: any) => { this.upsertOne(ctx, row ?? payload); this.setLoading(ctx, false); }),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to update patient'); return of(null); })
    );
  }

  @Action(PatientActions.Delete)
  delete(ctx: StateContext<PatientStateModel>, { id }: PatientActions.Delete) {
    this.setLoading(ctx, true);
    const call = this.api.deletePatientByID ? this.api.deletePatientByID(id) : null;
    if (!call) { this.setError(ctx, 'No deletePatientByID() method found'); return of(null); }
    return call.pipe(
      tap(() => this.removeOne(ctx, id)),
      catchError(err => { this.setError(ctx, err?.message ?? 'Failed to delete patient'); return of(null); })
    );
  }
}
