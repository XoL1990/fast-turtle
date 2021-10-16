import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InterpreterService, Line } from 'src/app/services/interpreter.service';

@Component({
  selector: 'app-textarea-lines',
  templateUrl: './textarea-lines.component.html',
  styleUrls: ['./textarea-lines.component.scss']
})
export class TextareaLinesComponent implements OnInit, OnDestroy {
  @ViewChild('textarea') textarea: ElementRef<HTMLElement>;

  lines: Line[] = [];

  private linesSubscription: Subscription;

  constructor(private interpreterService: InterpreterService) { }

  ngOnInit(): void {
    this.linesSubscription = this.interpreterService.getLinesObservable().subscribe(lines => {
      this.lines = lines;
    });
  }

  ngOnDestroy(): void {
    if (this.linesSubscription) {
      this.linesSubscription.unsubscribe();
    }
  }

  setText(text: string) {
    this.textarea.nativeElement.innerText = text;
    this.interpreterService.updateLines(text);
  }

  onTextChange(event: Event): void {
    if (event.target) {
      const htmlElement = event.target as HTMLElement;
      const text = this.convertToText(htmlElement.innerHTML);
      this.interpreterService.updateLines(text);
    }
  }

  private convertToText(str = '') {
    // Ensure string.
    let value = String(str);
  
    // Convert encoding.
    value = value.replace(/&nbsp;/gi, ' ');
    value = value.replace(/&amp;/gi, '&');
  
    // Replace `<br>`.
    value = value.replace(/<br>/gi, '\n');
  
    // Replace `<div>` (from Chrome).
    value = value.replace(/<div>/gi, '\n');
  
    // Replace `<p>` (from IE).
    value = value.replace(/<p>/gi, '\n');
  
    // Remove extra tags.
    value = value.replace(/<(.*?)>/g, '');
  
    // Trim each line.
    value = value
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
  
    // No more than 2x newline, per "paragraph".
    //value = value.replace(/\n\n+/g, '\n\n');
    value = value.replace(/\n\n/g, '\n');
  
    // Clean up spaces.
    value = value.replace(/[ ]+/g, ' ');
    //value = value.trim();
  
    // Expose string.
    return value;
  }
}
