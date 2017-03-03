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
    }

    ionViewWillLoad() {
        this.observeChats();
    }

    ionViewWillUnload() {
        this.chatS.stopObservingChats();
    }

    observeChats() {
        this.chatS.observeChats().subscribe(snapshot => {
            var chats = [];
            var chatCount = 0;
            for (var key in snapshot) {
                var chat = snapshot[key];
                let uid = '';
                for (var userId in chat.users) {
                    if (userId != this.userS.user.id) {
                        uid = userId;
                    }
                }
                this.userS.fetchUser(uid).then(user => {
                    console.log("Adding user and time properties to chat object...");
                    chat['user'] = user;
                    chat['time'] = this.getTimeStringFrom(chat.timestamp);
                    chats.push(chat);
                    chatCount++;
                    if (chatCount == new Array(snapshot).length) {
                        chats.sort(function(a, b){
                            return a.timestamp-b.timestamp;
                        });
                        this.chats = chats;
                        this.fetchUnreadCount();
                    }
                }).catch(error => {
                    console.log(error);
                    chatCount++;
                    if (chatCount == new Array(snapshot).length) {
                        chats.sort(function(a, b){
                            return a.timestamp-b.timestamp;
                        });
                        this.chats = chats;
                        this.fetchUnreadCount();
                    }
                });
            }
        });
    }

    fetchUnreadCount() {
        var chats = [];
        var chatCount = 0;
        for (var key in this.chats) {
            let chat = this.chats[key];
            this.chatS.fetchUnreadCountIn(chat).then(unreadCount => {
                if (unreadCount) {
                    chat['unreadCount'] = unreadCount;
                }
                chats.push(chat);
                chatCount++;
                if (chatCount == this.chats.length) {
                    chats.sort(function(a, b){
                        return a.timestamp-b.timestamp;
                    });
                    this.chats = chats;
                }
            }).catch(error => {
                console.log(error);
                chats.push(chat);
                chatCount++;
                if (chatCount == this.chats.length) {
                    chats.sort(function(a, b){
                        return a.timestamp-b.timestamp;
                    });
                    this.chats = chats;
                }
            });
        }
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