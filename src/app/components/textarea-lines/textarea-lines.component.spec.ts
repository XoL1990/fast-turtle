import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaLinesComponent } from './textarea-lines.component';

describe('TextareaLinesComponent', () => {
  let component: TextareaLinesComponent;
  let fixture: ComponentFixture<TextareaLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextareaLinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextareaLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
