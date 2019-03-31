import { Component, OnInit } from '@angular/core';
import { UiBuilder } from '../extensions';

@Component({
  selector: 'app-modal-help',
  templateUrl: './modal-help.component.html',
  styles: []
})
export class ModalHelpComponent implements OnInit {

  title = 'Ohje';
  body = `
<p><img src="assets/help1.png" class="img-fluid img-thumbnail" alt="Käyttöliittymä koostuu (1) tekstilaatikosta, (2) painikkeista tekstirivien vieressä ja (3) valikkopalkista"></p>
<ol>
  <li>Kirjoita runosäkeet tekstialueelle. Virheelliset tavut alleviivataan punaisella.</li>
  <li>Saat lisätietoa mahdollisista virheistä painamalla rivin vieressä olevaa painiketta.</li>
  <li>Tekstiin tehdyt muutokset tallennetaan automaattisesti omalle laitteellesi. Valikon avulla voit luoda, poistaa ja avata tallennettuja tekstejä.</li>
</ol>
  `;

  constructor() { 
    if (UiBuilder !== null) {
      const builder = new UiBuilder();
      this.body = builder.helpHtml;
    }
  }

  ngOnInit() {
  }

}
