import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { EditorComponent } from './editor/editor.component';
import { ModalDetailsComponent } from './modal-details/modal-details.component';
import { ModalEditTitleComponent } from './modal-edit-title/modal-edit-title.component';
import { ModalOpenDocComponent } from './modal-open-doc/modal-open-doc.component';
import { ModalAboutComponent } from './modal-about/modal-about.component';
import { ModalHelpComponent } from './modal-help/modal-help.component';
import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MenuComponent,
        EditorComponent,
        ModalDetailsComponent,
        ModalEditTitleComponent,
        ModalOpenDocComponent,
        ModalAboutComponent,
        ModalHelpComponent
      ],
      imports: [
        FormsModule
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
