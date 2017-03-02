import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { LoadingService } from '../../providers/loading-service';
import { ChatService } from '../../providers/chat-service';

import { ChatPage } from '../chat/chat';

/*
  Generated class for the Matched page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-matched',
  templateUrl: 'matched.html'
})
export class MatchedPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private loadingS: LoadingService,
              private chatS: ChatService) {

  }

  chat() {
    console.log("Chat pressed");
    let user = this.loadingS.otherUser;
    this.viewCtrl.dismiss();
    this.chatS.chatWith(user).then(chat => {
        if (chat) {
            this.navCtrl.push(ChatPage, {
                user: user,
                chat: chat
            });
        } else {
            console.log("No chat returned!");
        }
    }).catch(error => {
        console.log(error);
    });

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
