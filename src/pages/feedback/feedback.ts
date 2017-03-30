import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { UserService } from '../../providers/user-service';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class FeedbackPage {

  input = ""

  constructor(private alertCtrl: AlertController, private userS: UserService) {
  }

  send() {
      console.log('Send pressed with input: ', this.input);
      let text = this.input.replace(/^\s+/, '').replace(/\s+$/, '');
      if (text !== '') {
          // text has real content
          let input = this.input;
          this.input = "";
          this.userS.sendFeedback(input);
          let alert = this.alertCtrl.create({
            title: 'Thank you!',
            message: 'Your message has been received.',
            buttons: ['Dismiss']
          });
          alert.present();
      }
  }

}