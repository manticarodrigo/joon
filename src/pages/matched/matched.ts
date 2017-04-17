import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ChatService } from '../../providers/chat-service';

import { ChatPage } from '../chat/chat';

@Component({
  selector: 'page-matched',
  templateUrl: 'matched.html'
})
export class MatchedPage {
  user: any;
  otherUser: any;
  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private chatS: ChatService) {
    this.user = this.navParams.get('user');
    this.otherUser = this.navParams.get('otherUser');
  }

  chat() {
    console.log("Chat pressed");
    this.chatS.chatWith(this.otherUser).then(chat => {
        if (chat) {
          this.viewCtrl.dismiss([this.otherUser, chat]);
        } else {
            console.log("No chat returned!");
            this.dismiss;
        }
    }).catch(error => {
        console.log(error);
        this.dismiss;
    });

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
