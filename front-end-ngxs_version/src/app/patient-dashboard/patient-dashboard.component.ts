import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PatientActions } from '../state/patients/patient.actions';
import { PatientState } from '../state/patients/patient.state';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss'
})
export class PatientDashboardComponent implements OnInit {
  private store = inject(Store);

  @Select(PatientState.selectAll) rows$!: Observable<any[]>;
  @Select(PatientState.loading)   loading$!: Observable<boolean>;
  @Select(PatientState.error)     error$!: Observable<string | null>;

  AddBtnPressed = false;
  EditBtnPressed = false;

  addPatientForm!: FormGroup<{
    patientName: FormControl<string | null>;
    patientEmail: FormControl<string | null>;
    patientPhone: FormControl<string | null>;
    patientAddress: FormControl<string | null>;
  }>;

  editPatientForm!: FormGroup<{
    patientID: FormControl<number | null>;
    patientName: FormControl<string | null>;
    patientEmail: FormControl<string | null>;
    patientPhone: FormControl<string | null>;
    patientAddress: FormControl<string | null>;
  }>;

  ngOnInit() {
    this.store.dispatch(new PatientActions.LoadAll());

    this.addPatientForm = new FormGroup({
      patientName:    new FormControl<string | null>(null, [Validators.required]),
      patientEmail:   new FormControl<string | null>(null),
      patientPhone:   new FormControl<string | null>(null),
      patientAddress: new FormControl<string | null>(null),
    });

    this.editPatientForm = new FormGroup({
      patientID:      new FormControl<number | null>(null),
      patientName:    new FormControl<string | null>(null, [Validators.required]),
      patientEmail:   new FormControl<string | null>(null),
      patientPhone:   new FormControl<string | null>(null),
      patientAddress: new FormControl<string | null>(null),
    });
  }

  // === template bindings ===
  activateForm() { this.AddBtnPressed = true; }
  deactivateForm() { this.AddBtnPressed = false; this.addPatientForm.reset(); }

  onSubmit() {
    if (this.addPatientForm.invalid) return;
    this.store.dispatch(new PatientActions.Create(this.addPatientForm.value))
      .subscribe(() => this.deactivateForm());
  }

  activateEditForm(p: any) {
    this.EditBtnPressed = true;
    this.editPatientForm.setValue({
      patientID:      p?.patientID ?? null,
      patientName:    p?.patientName ?? null,
      patientEmail:   p?.patientEmail ?? null,
      patientPhone:   p?.patientPhone ?? null,
      patientAddress: p?.patientAddress ?? null,
    });
  }
  deactivateEditForm() { this.EditBtnPressed = false; this.editPatientForm.reset(); }

  onEdit() {
    if (this.editPatientForm.invalid) return;
    this.store.dispatch(new PatientActions.Update(this.editPatientForm.value))
      .subscribe(() => this.deactivateEditForm());
  }

  deleteAction(id: number) {
    if (id == null) return;
    this.store.dispatch(new PatientActions.Delete(id));
  }

  get AllPatients(): any[] { let v: any[] = []; this.rows$.subscribe(r => v = r).unsubscribe(); return v; }
}
