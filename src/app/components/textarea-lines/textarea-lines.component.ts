import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InterpreterService, Line } from 'src/app/services/interpreter.service';

@Component({
  selector: 'app-textarea-lines',
  templateUrl: './textarea-lines.component.html',
  styleUrls: ['./textarea-lines.component.scss']
})
export class TextareaLinesComponent implements OnInit, OnDestroy {
  lines: Line[] = [];
  text: string = '';
  textRows: number = 0;

  private linesSubscription: Subscription;

  constructor(private interpreterService: InterpreterService) { }

  ngOnInit(): void {
    this.linesSubscription = this.interpreterService.getLinesObservable().subscribe(lines => {
      this.lines = lines;
      this.textRows = lines.length;
    });
  }

  ngOnDestroy(): void {
    if (this.linesSubscription) {
      this.linesSubscription.unsubscribe();
    }
  }

  setText(text: string) {
    this.text = text;
    this.interpreterService.updateLines(text);
  }

  onTextChange(): void {
    this.interpreterService.updateLines(this.text);
  }
}
