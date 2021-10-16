import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}

@Component({
  selector: 'app-resizable-draggable',
  templateUrl: './resizable-draggable.component.html',
  styleUrls: ['./resizable-draggable.component.scss']
})
export class ResizableDraggableComponent implements OnInit, AfterViewInit {
  @Input('width') public width: number = 400;
  @Input('height') public height: number = 700;
  @Input('left') public left: number = 20;
  @Input('top') public top: number = 20;
  @ViewChild("box") public box: ElementRef;

  private boxPosition: { left: number, top: number };
  public mouse: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick: {x: number, y: number, left: number, top: number}

  ngOnInit() {}

  ngAfterViewInit(){
    this.loadBox();
  }

  private loadBox(){
    const { left, top } = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = { left, top };
  }

  setStatus(event: MouseEvent, status: number){
    if(status === 1) event.stopPropagation();
    else if(status === 2) this.mouseClick = { x: event.clientX, y: event.clientY, left: this.left, top: this.top };
    else this.loadBox();
    this.status = status;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    this.mouse = { x: event.clientX, y: event.clientY };
    if(this.status === Status.RESIZE) this.resize();
    else if(this.status === Status.MOVE) this.move();
  }

  private resize(){
    let w = Number(this.mouse.x > this.boxPosition.left) ? this.mouse.x - this.boxPosition.left : 0;
    if (w < 200) {
      w = 200;
    }
    this.width = w;

    let h = Number(this.mouse.y > this.boxPosition.top) ? this.mouse.y - this.boxPosition.top : 0;
    if (h < 400) {
      h = 400;
    }
    this.height = h;
  }

  private move(){
    this.left = this.mouseClick.left + (this.mouse.x - this.mouseClick.x);
    this.top = this.mouseClick.top + (this.mouse.y - this.mouseClick.y);
  }
}