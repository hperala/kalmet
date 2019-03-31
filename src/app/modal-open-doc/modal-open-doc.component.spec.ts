import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOpenDocComponent } from './modal-open-doc.component';

describe('ModalOpenDocComponent', () => {
  let component: ModalOpenDocComponent;
  let fixture: ComponentFixture<ModalOpenDocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalOpenDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOpenDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
