import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { EditorComponent } from './editor/editor.component';
import { ModalDetailsComponent } from './modal-details/modal-details.component';
import { ModalEditTitleComponent } from './modal-edit-title/modal-edit-title.component';
import { ModalOpenDocComponent } from './modal-open-doc/modal-open-doc.component';
import { ModalAboutComponent } from './modal-about/modal-about.component';
import { ModalHelpComponent } from './modal-help/modal-help.component';

@NgModule({
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
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
