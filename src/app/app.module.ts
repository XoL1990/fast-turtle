import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ResizableDraggableComponent } from './components/resizable-draggable/resizable-draggable.component';
import { TextareaLinesComponent } from './components/textarea-lines/textarea-lines.component';

@NgModule({
  declarations: [
    AppComponent,
    ResizableDraggableComponent,
    TextareaLinesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
