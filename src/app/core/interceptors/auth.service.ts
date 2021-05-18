import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {
  count: number = 0;

  constructor(private route: Router, private spinner : NgxSpinnerService, private toast: ToastrService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show();
    
    this.count++;

    const token = localStorage.getItem('accessToken') || '';


    if (localStorage.getItem('accessToken')) {
      request = request.clone(
        {
          headers: new HttpHeaders({
            'Authorization': 'Bearer ' + token,
          })
        });
    }
    

    return next.handle(request).pipe(catchError((error: HttpErrorResponse) => {
      console.log('[AuthService.ts]');
      console.log(error);
      console.log(error.status);
      console.log(error.message);
      console.log('[AuthService token = ]'+token)
      console.log()
      console.log(request)
      console.log('end [AuthService.ts]');
      if (error.status == 401) { //403
        if (request.url.includes('info') == false) {
          //this.ngxLoader.stop();
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          this.route.navigateByUrl('/login')
        }
      };


      if (error.status == 500) { //TODO: refresh token, add endpoint refresh  backend
        console.log('STATUS 500')
        //TODO: MANAGE REFRESH TOKEN IN BACKEND
        this.route.navigateByUrl('/login')
        console.log('PLEASE, RENEW TOKEN , DEVES VOLVERTE A LOGUEAR')
        this.toast.info('You need to log in', 'INFO')
        //this.ngxLoader.stop();
        /*localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
         */

      };

      if (error.status == 404) { //TODO: refresh token, add endpoint refresh  backend
        console.log('STATUS 404')
        this.toast.warning(error.error['message'], 'Info');
        //this.ngxLoader.stop();
        /*localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
         */

      };
      
      return next.handle(request)
    })).pipe(
      finalize(() => {
        /* console.log('Desde el interceptor! -> token = ' + token)
        console.log('Desde el interceptor! -> request = ')
        console.log(request) */
        this.count--;
        

        /* setTimeout(() => {
          this.spinner.hide();
        }, 200); */

        if (this.count == 0 ) {
          this.spinner.hide(); 
        }

      })
    );
  }

}