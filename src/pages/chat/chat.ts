import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ChatService } from '../../providers/chat-service';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
    
    viewState = "";
    chatInput = "";
    user: any;
    chat: any;
    messages: Array<any>;

    constructor(private nav: NavController,
                private navParams: NavParams,
                private chatS: ChatService) {
        this.user = navParams.get('user');
        this.chat = navParams.get('chat');
        this.viewState = "messages";
    }

    ionViewWillLoad() {
        this.chatS.observeMessagesIn(this.chat).subscribe(snapshot => {
            var messages = [];
            for (var key in snapshot) {
                var data = snapshot[key];
                if (data.sender == this.user) {
                    data['position'] = 'left';
                } else {
                    data['position'] = 'right';
                }
                messages.push(data);
            }
            this.messages = messages;
        });
    }
    
    attach() {
        console.log('attach');
    }
    
    send() {
        console.log(this.chatInput);
        let text = this.chatInput.replace(/^\s+/, '').replace(/\s+$/, '');
        if (text === '') {
            // text was all whitespace
        } else {
            // text has real content
            this.chatS.sendMessageTo(this.chatInput, this.user);
            this.chatInput = "";
        }
    }

}