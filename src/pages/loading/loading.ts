import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { LoadingService } from '../../providers/loading-service';

@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html'
})
export class LoadingPage {
  
  constructor(private loadingS: LoadingService) {
  }

}
