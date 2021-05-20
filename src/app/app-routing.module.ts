import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  },

  {
    path: 'login', // login 
    loadChildren: () =>
      import('src/app/modules/login/login.module').then(m => m.LoginModule)
  },

  {
    path: 'register',
    loadChildren: () =>
      import('src/app/modules/register/register.module').then(m => m.RegisterModule)
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('src/app/modules/main/main.module').then(m => m.MainModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
