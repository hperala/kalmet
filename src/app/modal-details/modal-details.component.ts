import { Component, OnInit, Input } from '@angular/core';
import { PresentationalLine } from '../presentational-line';
import { UiBuilder } from '../extensions';

@Component({
  selector: 'app-modal-details',
  templateUrl: './modal-details.component.html',
  styles: []
})
export class ModalDetailsComponent implements OnInit {
  @Input() line: PresentationalLine;

  private _line;
  builder;
  errorPanelVisible = true;
  currentRuleHtml = '';

  constructor() {
    this.builder = null;
    if (UiBuilder !== null) {
      this.builder = new UiBuilder();
    }
  }

  ngOnInit() {
  }

  onShowRule(ruleHtml) {
    this.currentRuleHtml = ruleHtml;
    this.errorPanelVisible = false;
  }

  onHideRule() {
    this.errorPanelVisible = true;
  }

  reset() {
    this.errorPanelVisible = true;
  }
}
