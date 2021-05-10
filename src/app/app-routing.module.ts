import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [

  {
    path: 'login', // login 
    loadChildren: () =>
      import('src/app/modules/login/login.module').then(m => m.LoginModule)
  },
  { 
    path: 'home', 
    //canActivate: [ControlCanViewComponent],
    loadChildren: () => 
    import('src/app/modules/main/main.module').then(m => m.MainModule) 
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
