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
    this.chatS.chatWith(user.id).then(chat => {
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
