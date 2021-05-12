import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {
  count: number = 0;

  constructor(private route: Router, private spinner : NgxSpinnerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show();
    
    this.count++;

    const token = 'Bearer ' + localStorage.getItem('accessToken') || '';

    const headers = new HttpHeaders({
      'Authorization': token
    })

    if (localStorage.getItem('accessToken')) {
      request = request.clone(
        {
          headers: new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
          })
        });
    }
    

    return next.handle(request).pipe(catchError((error: HttpErrorResponse) => {
      console.log(error);
      if (error.status == 401) { //403
        if (request.url.includes('info') == false) {
          //this.ngxLoader.stop();
          localStorage.removeItem('accessToken');
          localStorage.removeItem('username');
          this.route.navigateByUrl('/login')
        }
      };
      
      return next.handle(request)
    })).pipe(
      finalize(() => {
        console.log('Desde el interceptor! -> token = ' + token)
        console.log('Desde el interceptor! -> request = ')
        console.log(request)
        this.count--;
        //this.ngxLoader.stop(); 

        setTimeout(() => {
          this.spinner.hide();
        }, 200);

        /* if (this.count == 0 ) {
          this.spinner.hide(); 
        } */

      })
    );
  }

}