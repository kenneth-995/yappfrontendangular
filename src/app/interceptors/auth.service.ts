import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string = 'asdasdasd';

    let request = req;

    let headers = {
      'Content-Type':'application/json',
     // 'Access-Control-Allow-Origin:': '*'
    };

    
    request = req.clone({
      setHeaders: headers
    });
    console.log('[interceptor]: ')
    console.log('headers: ')
    console.log(request.headers)
    console.log('body: ')
    console.log(request.body)
    console.log('[end interceptor]: ')

    return next.handle(request);
  }

}