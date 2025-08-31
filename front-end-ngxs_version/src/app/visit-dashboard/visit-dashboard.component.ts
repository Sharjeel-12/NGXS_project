import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { VisitActions } from '../state/visits/visit.actions';
import { VisitState } from '../state/visits/visit.state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visit-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visit-dashboard.component.html',
  styleUrl: './visit-dashboard.component.scss'
})
export class VisitDashboardComponent implements OnInit {
  private store = inject(Store);

  @Select(VisitState.selectAll) rows$!: Observable<any[]>;
  @Select(VisitState.loading)   loading$!: Observable<boolean>;
  @Select(VisitState.error)     error$!: Observable<string | null>;

  AddBtnPressed = false;
  EditBtnPressed = false;

  addVisitForm!: FormGroup<{
    visitTypeID: FormControl<number | null>;
    visitType:   FormControl<string | null>;
    visitDuration: FormControl<number | null>;
    visitDate:   FormControl<string | null>;
    visitFee:    FormControl<number | null>;
  }>;

  editVisitForm!: FormGroup<{
    visitID:      FormControl<number | null>;
    visitTypeID:  FormControl<number | null>;
    visitType:    FormControl<string | null>;
    visitDuration:FormControl<number | null>;
    visitDate:    FormControl<string | null>;
    visitFee:     FormControl<number | null>;
  }>;

  ngOnInit() {
    this.store.dispatch(new VisitActions.LoadAll());
    this.addVisitForm = new FormGroup({
      visitTypeID:   new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
      visitType:     new FormControl<string | null>(null),
      visitDuration: new FormControl<number | null>(null),
      visitDate:     new FormControl<string | null>(null),
      visitFee:      new FormControl<number | null>(null)
    });

    this.editVisitForm = new FormGroup({
      visitID:       new FormControl<number | null>(null),
      visitTypeID:   new FormControl<number | null>(null),
      visitType:     new FormControl<string | null>(null),
      visitDuration: new FormControl<number | null>(null),
      visitDate:     new FormControl<string | null>(null),
      visitFee:      new FormControl<number | null>(null)
    });
  }

  activateForm() { this.AddBtnPressed = true; }
  deactivateForm() { this.AddBtnPressed = false; this.addVisitForm.reset(); }

  onSubmit() {
    if (this.addVisitForm.invalid) return;
    this.store.dispatch(new VisitActions.Create(this.addVisitForm.value))
      .subscribe(() => this.deactivateForm());
  }

  activateEditForm(v: any) {
    this.EditBtnPressed = true;
    this.editVisitForm.setValue({
      visitID: v.visitID ?? null,
      visitTypeID: v.visitTypeID ?? null,
      visitType: v.visitType ?? null,
      visitDuration: v.visitDuration ?? null,
      visitDate: v.visitDate ?? null,
      visitFee: v.visitFee ?? null
    });
  }
  deactivateEditForm() { this.EditBtnPressed = false; this.editVisitForm.reset(); }

  onEdit() {
    if (this.editVisitForm.invalid) return;
    this.store.dispatch(new VisitActions.Update(this.editVisitForm.value))
      .subscribe(() => this.deactivateEditForm());
  }

  deleteAction(id: number) {
    if (id == null) return;
    this.store.dispatch(new VisitActions.Delete(id));
  }

  displayDate(d?: string | null) {
    if (!d) return '';
    return new Date(d).toLocaleString();
  }

  get AllVisits(): any[] { 
    let val: any[] = []; 
    this.rows$.subscribe(r => val = r).unsubscribe(); 
    return val; 
  }
}
