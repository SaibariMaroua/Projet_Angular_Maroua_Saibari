import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminP3Component } from './admin-p3.component';

describe('AdminP3Component', () => {
  let component: AdminP3Component;
  let fixture: ComponentFixture<AdminP3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminP3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminP3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
