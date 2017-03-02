import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DiscoverService } from '../../providers/discover-service';
import { UserService } from '../../providers/user-service';
import { LoadingService } from '../../providers/loading-service';
import { ChatService } from '../../providers/chat-service';

import { LoadingPage } from '../loading/loading';
import { ChatPage } from '../chat/chat';

@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html'
})
export class ChatsPage {
    
    selectedUser: any;
    matchedUsers: Array<any>;
    chats: Array<any>;

    constructor(private navCtrl: NavController,
                private navParams: NavParams,
                private discoverS: DiscoverService,
                private userS: UserService,
                private loadingS: LoadingService,
                private chatS: ChatService) {
        this.matchedUsers = [];
        this.fetchMatchedUsers();
    }
    
    fetchMatchedUsers() {
        this.loadingS.user = this.userS.user;
        this.loadingS.message = "Fetching your matches...";
        if (!this.loadingS.isActive) {
            this.loadingS.create(LoadingPage);
            this.loadingS.present();
        }
        this.discoverS.fetchMatchedUsers().then(matchedUsers => {
            console.log(matchedUsers);
            this.matchedUsers = matchedUsers;
            this.loadingS.dismiss();
        }).catch(error => {
            console.log(error);
        });
    }

    userTapped(event, user) {
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

}