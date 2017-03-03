import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ChatService } from '../../providers/chat-service';

import { ChatPage } from '../chat/chat';

@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html'
})
export class ChatsPage {

    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                private chatS: ChatService) {
    }

    userTapped(event, user) {
        this.chatS.chatWith(user.id).then(chat => {
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

}