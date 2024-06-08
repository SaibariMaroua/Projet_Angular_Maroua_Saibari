import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminP4Component } from './admin-p4.component';

describe('AdminP4Component', () => {
  let component: AdminP4Component;
  let fixture: ComponentFixture<AdminP4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminP4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminP4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
