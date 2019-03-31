import { Component, OnInit } from '@angular/core';
import { UiBuilder } from '../extensions';

@Component({
  selector: 'app-modal-about',
  templateUrl: './modal-about.component.html',
  styles: []
})
export class ModalAboutComponent implements OnInit {

  title = 'Kalevalamitan tarkistin';
  body = '<p></p>';

  constructor() { 
    if (UiBuilder !== null) {
      const builder = new UiBuilder();
      this.title = builder.title;
      this.body = builder.aboutHtml;
    }
  }

  ngOnInit() {
  }

}
