import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';

@Injectable()
export class LoadingService {
  modal: any;
  user: any;
  otherUser: any;
  message: any;
  isActive: boolean = false;
  constructor(public modalCtrl: ModalController) {
  }

  create(page) {
    this.modal = this.modalCtrl.create(page);
  }

  present() {
    this.modal.present().then(() => {
      this.isActive = true;
    });
  }

  dismiss() {
    this.modal.dismiss();
    this.isActive = false;
  }

}