import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { LoginService } from '../Services/login.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageComponent } from '../admin-page/admin-page.component';
import { ReceptionistPageComponent } from '../receptionist-page/receptionist-page.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AdminPageComponent,ReceptionistPageComponent,ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
constructor(private loginServcie:LoginService, private router:Router) {}

loginForm!:FormGroup;
userToken!:string;
userRole!:string;
loginError!:string;

// important booleans

isAdmin:boolean=false;
isReceptionist:boolean=false;

ngOnInit(): void {
  this.loginForm= new FormGroup({
    email:new FormControl<string|null>(null,[Validators.required,Validators.email]),
    password:new FormControl<string|null>(null,[Validators.required,Validators.minLength(3)])
  })
}

validateUser():void{
  this.loginServcie.getLoginResponse(this.loginForm.value.email,this.loginForm.value.password).subscribe({
    next: (res) => {
      try {
        if (res?.token) sessionStorage.setItem('access_token', res.token);
        if (res?.role) sessionStorage.setItem('role', res.role);
        if (res?.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (res?.role === 'Receptionist') {
          this.router.navigate(['/receptionist']);
        }
      } catch (_) {}

      this.userToken=res.token;
      this.loginError=res.error;
      this.userRole=res.role;



      // Authentication
  if(this.userToken){
  sessionStorage.setItem("token",this.userToken);
  alert(`login Successful as: ${this.userRole}`)
}
else{
  alert(this.loginError);
}


// Authorization
if(this.userRole==="Admin"){
  this.isAdmin=true;
}
if(this.userRole==="Receptionist"){
this.isReceptionist=true;
}
    }
  }



)


}

}
