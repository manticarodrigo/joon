import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ModalService } from '../../providers/modal-service';

@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html'
})
export class LoadingPage {
  
  constructor(private modalS: ModalService) {
  }

}