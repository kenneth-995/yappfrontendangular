import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( 
    private _router: Router

    ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
      
      let token = localStorage.getItem("accessToken")
        if (token == null || token == ""){
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          localStorage.removeItem('id');
          localStorage.removeItem('user');
          this._router.navigateByUrl('/login');
        } else {
          return true;
        }
  }
  
}
