import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { ModalService } from '../../providers/modal-service';
import { ChatService } from '../../providers/chat-service';

import { ChatPage } from '../chat/chat';

@Component({
  selector: 'page-matched',
  templateUrl: 'matched.html'
})
export class MatchedPage {

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private modalS: ModalService,
              private chatS: ChatService) {

  }

  chat() {
    console.log("Chat pressed");
    let user = this.modalS.otherUser;
    this.chatS.chatWith(user).then(chat => {
        if (chat) {
          this.viewCtrl.dismiss([user, chat]);
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
