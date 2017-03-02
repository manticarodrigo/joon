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

    ionViewWillUnload() {
        this.chatS.stopObservingChats();
    }
    
    fetchMatchedUsers() {
        this.loadingS.user = this.userS.user;
        this.loadingS.message = "Fetching your matches...";
        if (!this.loadingS.isActive) {
            this.loadingS.create(LoadingPage);
            this.loadingS.present();
        }
        this.discoverS.fetchUserMatches().then(matchedIds => {
            console.log(matchedIds);
            let users = [];
            let matchCount = 0;
            let dictCount = Object.keys(matchedIds).length;
            for (var uid in matchedIds) {
                this.userS.fetchUser(uid).then(user => {
                    users.push(user);
                    matchCount++;
                    if (matchCount == dictCount) {
                        this.matchedUsers = users;
                        this.fetchChats();
                        this.loadingS.dismiss();
                    }
                }).catch(error => {
                    console.log(error);
                    matchCount++;
                    if (matchCount == dictCount) {
                        this.matchedUsers = users;
                        this.fetchChats();
                        this.loadingS.dismiss();
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    fetchChats() {
        let chats = [];
        for (var i=0; i < this.matchedUsers.length; i++) {
            let user = this.matchedUsers[i];
            this.chatS.chatWith(user).then(chat => {
                chat['time'] = this.getTimeStringFrom(chat.timestamp);
                chat['user'] = user;
                chats.push(chat);
                if (i == this.matchedUsers.length) {
                    console.log(chats);
                    this.chats = chats;
                    this.observeChats();

                }
            }).catch(error => {
                console.log('uh oh!');
                console.log(error);
                if (i == this.matchedUsers.length) {
                    this.chats = chats;
                    this.observeChats();
                }
            });
        }
    }

    observeChats() {
        this.chatS.observeChats().subscribe(snapshot => {
            var chats = [];
            var chatCount = 0;
            for (var key in snapshot) {
                var data = snapshot[key];
                data['time'] = this.getTimeStringFrom(data.timestamp);
                delete data.users[this.userS.user.id];
                let uid = data.users[0]; 
                this.userS.fetchUser(uid).then(user => {
                    data['user'] = user;
                    chats.push(data);
                    chatCount++;
                    if (chatCount == new Array(snapshot).length) {
                        this.chats = chats;
                    }
                }).catch(error => {
                    console.log(error);
                    chatCount++;
                    if (chatCount == new Array(snapshot).length) {
                        this.chats = chats;
                    }
                });
            }
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

    getTimeStringFrom(timestamp) {
        let date = new Date(timestamp);
        date.setDate(date.getDate());
        var string = date.toString();
        var stringArr = string.split(" ");
        var day = stringArr[0];
        var time = this.tConvert(stringArr[4]);

        let now = new Date();
        var seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + " years ago";
        } else if (interval == 1) {
            return interval + " year ago";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months ago";
        } else if (interval == 1) {
            return interval + " month ago";
        }
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            if (interval < 5) {
                let daysAgo = new Date(now);
                daysAgo.setDate(daysAgo.getDate() - interval);
                var string = daysAgo.toString();
                var stringArr = string.split(" ");
                var day = stringArr[0];
                var time = this.tConvert(stringArr[4]);
                return day + ' ' + time;
            } else {
                return interval + " days ago";
            }
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return time;
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    }

    tConvert(time) {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) { // If time format correct
            time = time.slice (1);  // Remove full string match value
            time[3] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join (''); // return adjusted time or original string
    }

}