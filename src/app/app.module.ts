import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
