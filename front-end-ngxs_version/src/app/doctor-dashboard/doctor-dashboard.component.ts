import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DoctorActions } from '../state/doctors/doctor.actions';
import { DoctorState } from '../state/doctors/doctor.state';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent implements OnInit {
  private store = inject(Store);

  @Select(DoctorState.selectAll) rows$!: Observable<any[]>;
  @Select(DoctorState.loading)   loading$!: Observable<boolean>;
  @Select(DoctorState.error)     error$!: Observable<string | null>;

  AddBtnPressed = false;
  EditBtnPressed = false;

  addDoctorForm!: FormGroup<{
    doctorName: FormControl<string | null>;
    doctorEmail: FormControl<string | null>;
    doctorPhone: FormControl<string | null>;
    doctorSpeciality: FormControl<string | null>;
  }>;

  editDoctorForm!: FormGroup<{
    doctorID: FormControl<number | null>;
    doctorName: FormControl<string | null>;
    doctorEmail: FormControl<string | null>;
    doctorPhone: FormControl<string | null>;
    doctorSpeciality: FormControl<string | null>;
  }>;

  ngOnInit() {
    this.store.dispatch(new DoctorActions.LoadAll());

    this.addDoctorForm = new FormGroup({
      doctorName:        new FormControl<string | null>(null, [Validators.required]),
      doctorEmail:       new FormControl<string | null>(null),
      doctorPhone:       new FormControl<string | null>(null),
      doctorSpeciality:  new FormControl<string | null>(null),
    });

    this.editDoctorForm = new FormGroup({
      doctorID:          new FormControl<number | null>(null),
      doctorName:        new FormControl<string | null>(null, [Validators.required]),
      doctorEmail:       new FormControl<string | null>(null),
      doctorPhone:       new FormControl<string | null>(null),
      doctorSpeciality:  new FormControl<string | null>(null),
    });
  }

  // === template bindings (keep UI working) ===
  activateForm() { this.AddBtnPressed = true; }
  deactivateForm() { this.AddBtnPressed = false; this.addDoctorForm.reset(); }

  onSubmit() {
    if (this.addDoctorForm.invalid) return;
    this.store.dispatch(new DoctorActions.Create(this.addDoctorForm.value))
      .subscribe(() => this.deactivateForm());
  }

  activateEditForm(d: any) {
    this.EditBtnPressed = true;
    this.editDoctorForm.setValue({
      doctorID:         d?.doctorID ?? null,
      doctorName:       d?.doctorName ?? null,
      doctorEmail:      d?.doctorEmail ?? null,
      doctorPhone:      d?.doctorPhone ?? null,
      doctorSpeciality: d?.doctorSpeciality ?? null,
    });
  }
  deactivateEditForm() { 
      this.EditBtnPressed = false;
     this.editDoctorForm.reset(); 
    }

  onEdit() {
    if (this.editDoctorForm.invalid) return;
    this.store.dispatch(new DoctorActions.Update(this.editDoctorForm.value))
      .subscribe(() => this.deactivateEditForm());
  }

  deleteAction(id: number) {
    if (id == null) return;
    this.store.dispatch(new DoctorActions.Delete(id));
  }

  get AllDoctors(): any[] { 
    let v: any[] = []; 
    this.rows$.subscribe(r => v = r).unsubscribe();
    return v;
  }
}
