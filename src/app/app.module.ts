import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserService } from './services/user.service';
import { AuthService } from './interceptors/auth.service';

import { HeaderComponent } from './modules/shared/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthService,
      multi: true, //Actua en todas las peticiones, en login no haria falta, pero tampoco afecta
    },
  ],
  //providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
