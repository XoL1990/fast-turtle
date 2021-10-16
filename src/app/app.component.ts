import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { TextareaLinesComponent } from './components/textarea-lines/textarea-lines.component';
import { Command, InterpreterService, ParsedLine } from './services/interpreter.service';
import { Helpers } from './utils/helpers';

// TODO: move it to file
export interface Vector {
  x: number;
  y: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  // settings
  private static speed = 1000 / 30; // 0 - infinity
  private static turtleSize = 100;
  // ---

  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('turtlecanvas') public canvasTurtle: ElementRef;
  @ViewChild('turtle') public turtle: ElementRef;

  // for test only
  @ViewChild('textarea') textarea: TextareaLinesComponent;
  private showTest = false;

  hideTurtle = false;

  private ctx: CanvasRenderingContext2D | null;
  private ctxTurtle: CanvasRenderingContext2D | null;

  private currentLineIndexToDraw: number;;
  private currentLinesToDraw: ParsedLine[];
  private currentPosition: Vector;
  private currentRotation: number;
  private penOff: boolean;

  private drawTimeout: any = null;
  private drawFrameRequest = 0;

  constructor(private interpreterService: InterpreterService) { }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctxTurtle = this.canvasTurtle.nativeElement.getContext('2d');
    this.updateCanvasesSize();
  }

  onRunHandle() {
    if (!this.ctx || !this.ctxTurtle) {
      throw new Error("Canvas context is null");
    }

    this.hideTurtle = true;

    this.clear();

    const lines = this.interpreterService.getValidLines()
    if (!lines || !lines.length) {
      this.drawError();
      return;
    }
    this.draw(lines);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateCanvasesSize();
  }

  private updateCanvasesSize() {
    this.updateCanvasSize(this.canvasTurtle.nativeElement);
    this.updateCanvasSize(this.canvas.nativeElement);
  }

  private updateCanvasSize(canvasEl: HTMLCanvasElement) {
    canvasEl.height = window.innerHeight;
    canvasEl.width = window.innerWidth;
  }

  private clear() {
    this.restoreDefaultSettings();
    this.ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctxTurtle!.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  private restoreDefaultSettings() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const ctxTurtle = this.ctxTurtle!;
    ctxTurtle.resetTransform();
    this.drawTurtle(centerX, centerY);
    
    const ctx = this.ctx!;
    ctx.resetTransform();
    ctx.lineWidth = 1;
    ctx.strokeStyle ='#000';
    this.currentPosition = {x: centerX, y: centerY};
    this.currentRotation = 0;
    this.penOff = false;
  }

  private draw(lines: ParsedLine[]) {
    this.currentLineIndexToDraw = 0;
    this.currentLinesToDraw = lines;

    if (this.drawTimeout) {
      clearTimeout(this.drawTimeout);
    }

    if (this.drawFrameRequest !== undefined) {
      cancelAnimationFrame(this.drawFrameRequest);
    }
    this.drawFrameRequest = requestAnimationFrame(this.drawStep.bind(this));
  }

  private drawStep() {
    if (this.currentLineIndexToDraw >= this.currentLinesToDraw.length) {
      return;
    }

    let skipNextFrame = false;
    let updateTurtle = false;
    let turtleRotation: number | null = null;
    let move: number | null = null;

    let updatePosition: Vector | null = null;

    const ctx = this.ctx!;
    const ctxTurtle = this.ctxTurtle!;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const currentLineToDraw = this.currentLinesToDraw[this.currentLineIndexToDraw];
    switch (currentLineToDraw.command) {
      case Command.pencolor:
        ctx.strokeStyle = Helpers.rgbToHex(currentLineToDraw.params[0], currentLineToDraw.params[1], currentLineToDraw.params[2]);
        skipNextFrame = true;
        break;
      case Command.penwidth:
        ctx.lineWidth = currentLineToDraw.params[0];
        skipNextFrame = true;
        break;
      case Command.penup:
        this.penOff = true;
        skipNextFrame = true;
        break;
      case Command.pendown:
        this.penOff = false;
        skipNextFrame = true;
        break;
      case Command.center:
        updatePosition = { x: centerX, y: centerY };
        break;
      case Command.go:
        updatePosition = { x: currentLineToDraw.params[0], y: currentLineToDraw.params[1] };
        break;
      case Command.gox:
        updatePosition = { x: currentLineToDraw.params[0], y: this.currentPosition.y };
        break;
      case Command.goy:
        updatePosition = { x: this.currentPosition.x, y: currentLineToDraw.params[0] };
        break;
      case Command.forward: {
        move = this.currentPosition.y - currentLineToDraw.params[0];
        break;
      }
      case Command.backward: {
        move = this.currentPosition.y + currentLineToDraw.params[0];
        break;
      }
      case Command.turnleft:
        turtleRotation = -currentLineToDraw.params[0] * Math.PI / 180;
        break;
      case Command.turnright:
        turtleRotation = currentLineToDraw.params[0] * Math.PI / 180;
        break;
      case Command.direction:
        turtleRotation = -this.currentRotation + currentLineToDraw.params[0] * Math.PI / 180;
        break;
      case Command.test:
        this.test();
        return;
    }

    if (updatePosition) {
      this.currentPosition = updatePosition
      ctx.resetTransform();
      ctxTurtle.resetTransform();
      turtleRotation = this.currentRotation; // restore rotation after move
      this.currentRotation = 0;
      updateTurtle = true;
    }

    if (move !== null) {
      const x = this.currentPosition.x;
      if (!this.penOff) {
        ctx.beginPath();
        ctx.moveTo(x, this.currentPosition.y);
        ctx.lineTo(x, move);
        ctx.stroke();
      }
      this.currentPosition = { x, y: move };
      updateTurtle = true;
    }

    if (turtleRotation !== null) {
      this.currentRotation += turtleRotation;
      ctx.translate(this.currentPosition.x, this.currentPosition.y);
      ctx.rotate(turtleRotation);
      ctx.translate(-this.currentPosition.x, -this.currentPosition.y);
      updateTurtle = true;
    }

    if (updateTurtle) {
      ctxTurtle.save();
      ctxTurtle.resetTransform();
      ctxTurtle.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctxTurtle.restore();
      if (turtleRotation) {
        ctxTurtle.translate(this.currentPosition.x, this.currentPosition.y);
        ctxTurtle.rotate(turtleRotation);
        this.drawTurtle(0, 0);
        ctxTurtle.translate(-this.currentPosition.x, -this.currentPosition.y);
      }
      else {
        this.drawTurtle(this.currentPosition.x, this.currentPosition.y);
      }
    }

    this.currentLineIndexToDraw++;

    if (skipNextFrame || AppComponent.speed === 0) {
      this.drawStep();
      return;
    }

    this.drawTimeout = setTimeout(() => {
      this.drawFrameRequest = requestAnimationFrame(this.drawStep.bind(this));
    }, AppComponent.speed);
  }

  private drawTurtle(x: number, y: number) {
    const size = AppComponent.turtleSize;
    const pivotDelta = size / 2;
    this.ctxTurtle!.drawImage(this.turtle.nativeElement, x - pivotDelta, y - pivotDelta, size, size);
  }

  private drawError() {
    const ctx = this.ctx!;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    ctx.strokeStyle  = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX,centerY,100,0,Math.PI*2,true); // Outer circle
    ctx.moveTo(centerX - 50,centerY + 50);
    ctx.arc(centerX,centerY + 50,50,Math.PI,Math.PI*2,false);  // Mouth (clockwise)
    ctx.moveTo(centerX - 30, centerY - 40);
    ctx.arc(centerX - 40, centerY - 40,10,0,Math.PI*2,true);  // Left eye
    ctx.moveTo(centerX + 50, centerY - 40);
    ctx.arc(centerX + 40, centerY - 40,10,0,Math.PI*2,true);  // Right eye
    ctx.stroke();
  }

  private test() {
    if (!this.showTest) {
      this.showTest = true;
      this.textarea.setText('Are you sure?');
      return;
    }
    if (atob) {
      // testing only - do not check this please xD
      this.textarea.setText(atob('Z28gMjAwIDIwMApwZW5jb2xvciAyNTUgMjU1IDI1NQpwZW53aWR0aCAxMApiYWNrd2FyZCAxMDAK cGVuY29sb3IgMjU1IDAgMApiYWNrd2FyZCAxMDAKZGlyZWN0aW9uIC0xMjAKZm9yd2FyZCA1MApk aXJlY3Rpb24gLTcwCmZvcndhcmQgNTAKCgpnbyAzNTAgMjAwCmRpcmVjdGlvbiAwCnBlbmNvbG9y IDI1NSAyNTUgMjU1CnR1cm5sZWZ0IDkwCmZvcndhcmQgMTAwCnR1cm5sZWZ0IDkwCmZvcndhcmQg MTAwCnBlbnVwCmJhY2t3YXJkIDEwCnBlbmRvd24KdHVybmxlZnQgOTAKZm9yd2FyZCAxMDAKcGVu Y29sb3IgMjU1IDAgMApwZW51cAp0dXJubGVmdCA5MApmb3J3YXJkIC0xMAp0dXJubGVmdCA5MApw ZW5kb3duCmZvcndhcmQgMTAwCnR1cm5sZWZ0IDkwCmZvcndhcmQgMTAwCnR1cm5sZWZ0IDkwCmZv cndhcmQgMTAwCgoKZ28gNDgwIDIwMApkaXJlY3Rpb24gMApwZW5jb2xvciAyNTUgMjU1IDI1NQp0 dXJubGVmdCA5MApmb3J3YXJkIDgwCnR1cm5sZWZ0IDkwCmZvcndhcmQgMTAwCnBlbnVwCmJhY2t3 YXJkIDEwCnBlbmRvd24KdHVybmxlZnQgOTAKZm9yd2FyZCA4MApwZW5jb2xvciAyNTUgMCAwCnBl bnVwCnR1cm5sZWZ0IDkwCmZvcndhcmQgLTEwCnR1cm5sZWZ0IDkwCnBlbmRvd24KZm9yd2FyZCA4 MAp0dXJubGVmdCA5MApmb3J3YXJkIDEwMAp0dXJubGVmdCA5MApmb3J3YXJkIDgwCmdvIDQ4MCAy MDAKcGVuY29sb3IgMjU1IDI1NSAyNTUKZGlyZWN0aW9uIDE1MApmb3J3YXJkIDUwCmRpcmVjdGlv biAtMTUwCmZvcndhcmQgNTAKY2VudGVyCmdveCA0ODAKZ295IDMwMApwZW5jb2xvciAyNTUgMCAw CmRpcmVjdGlvbiAxNTAKZm9yd2FyZCA2MApkaXJlY3Rpb24gLTE1MApmb3J3YXJkIDYwCgpnbyA1 NTAgNDAwCnBlbmNvbG9yIDI1NSAwIDAKdHVybnJpZ2h0IDE3MApmb3J3YXJkIDExMApkaXJlY3Rp b24gOTAKZm9yd2FyZCA3NQp0dXJucmlnaHQgNzAKZm9yd2FyZCAxMTAKdHVybmxlZnQgMTgwCnBl bnVwCmZvcndhcmQgMTIwCnBlbmNvbG9yIDI1NSAyNTUgMjU1CnBlbmRvd24KZGlyZWN0aW9uIC05 MApmb3J3YXJkIDY1CnR1cm5yaWdodCAxMTAKZm9yd2FyZCAxMDAKdHVybnJpZ2h0IDE0MApmb3J3 YXJkIDEwMAoKZ28gODAwIDE4MApkaXJlY3Rpb24gMzAKZm9yd2FyZCA1MApnbyA4NTAgMjAwCmRp cmVjdGlvbiAtOTAKZm9yd2FyZCAxMDAKdHVybmxlZnQgOTAKZm9yd2FyZCAxMDAKcGVuY29sb3Ig MjU1IDAgMApmb3J3YXJkIDEwMAp0dXJubGVmdCA5MApmb3J3YXJkIDEwMAoKCmdvIDEyMDAgNDAw CmRpcmVjdGlvbiAwCmZvcndhcmQgMTAwCnR1cm5yaWdodCA5MApmb3J3YXJkIDEwMApwZW51cApw ZW5jb2xvciAyNTUgMjU1IDI1NQp0dXJubGVmdCA5MApmb3J3YXJkIDEwCnBlbmRvd24KdHVybmxl ZnQgOTAKZm9yd2FyZCAxMDAKdHVybnJpZ2h0IDkwCmZvcndhcmQgMTAwCnR1cm5yaWdodCA5MApm b3J3YXJkIDEwMAp0dXJucmlnaHQgOTAKZm9yd2FyZCA5MAp0dXJucmlnaHQgOTAKZm9yd2FyZCAx MDAKCmdvIDE0MDAgMjAwCmRpcmVjdGlvbiAxODAKZm9yd2FyZCAxMDAKcGVuY29sb3IgMjU1IDAg MApmb3J3YXJkIDEwMAoKZ28gMTUwMCA0MDAKZGlyZWN0aW9uIDkwCmZvcndhcmQgMTAwCnR1cm5s ZWZ0IDkwCmZvcndhcmQgMTAwCnR1cm5sZWZ0IDkwCmZvcndhcmQgMTAwCnR1cm5sZWZ0IDE4MApn byAxNTAwIDI5MApwZW5jb2xvciAyNTUgMjU1IDI1NQpmb3J3YXJkIDEwMApnbyAxNTAwIDI5MApk aXJlY3Rpb24gMApmb3J3YXJkIDEwMAp0dXJucmlnaHQgOTAKZm9yd2FyZCAxMDAKCmNlbnRlcgpk aXJlY3Rpb24gMA=='));
    }
  }
}
