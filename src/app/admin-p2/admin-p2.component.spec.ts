import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminP2Component } from './admin-p2.component';

describe('AdminP2Component', () => {
  let component: AdminP2Component;
  let fixture: ComponentFixture<AdminP2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminP2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminP2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
