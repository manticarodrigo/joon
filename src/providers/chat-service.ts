import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";
import firebase from 'firebase';

import { UserService } from './user-service';

@Injectable()
export class ChatService {

    chats: Array<any>;
    unreadCount = 0;

    constructor(private userS: UserService) {

    }
  
    chatWith(uid): Promise<any> {
        console.log("Chatting with user...");
        return new Promise((resolve, reject) => {
            let chatId = this.chatIdWith(uid);
            this.fetchChat(chatId).then(chat => {
                if (chat) {
                    this.updateUserActivityIn(chat);
                    resolve(chat);
                } else {
                    this.createChatWithUser(uid).then(chat => {
                        if (chat) {
                            resolve(chat);
                        } else {
                            reject(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                }
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }

    updateUserActivityIn(chat) {
        firebase.database().ref('/chats/' + chat.id + '/users/' + this.userS.user.id)
                    .set(new Date().getTime());
    }
    
    chatIdWith(uid) {
        var chatId = '';
            if (this.userS.user.id < uid) {
                chatId = this.userS.user.id + "_" + uid;
            } else {
                chatId = uid + "_" + this.userS.user.id;
            }
        return chatId;
    }
    
    fetchChat(chatId): Promise<any> {
        return new Promise((resolve, reject) => {
            let ref = firebase.database().ref('/chats/'+ chatId);
            ref.once('value').then(snap => {
                let val = snap.val();
                if (val) {
                    console.log("Found existing chat!");
                    console.log(val);
                    resolve(val);
                } else {
                    console.log("No chat found!");
                    resolve(null);
                }
            }).catch(error => {
                console.log(error);
                reject(null);
            });
        });
    }
        
    private createChatWithUser(uid): Promise<any> {
        console.log("Creating chat with user...");
        return new Promise((resolve, reject) => {
            this.userS.fetchUser(uid).then(user => {
                var chatId = this.chatIdWith(uid);
                var lastMessage = "Tap to say hello!";
                var now = new Date().getTime();
                var users = {};
                users[uid] = new Date().getTime();
                users[this.userS.user.id] = new Date().getTime();
                var val = { "lastMessage" : lastMessage, "timestamp" : now, "users" : users, 'id' : chatId };
                let ref = firebase.database().ref('/chats/' + chatId);
                ref.update(val).then(data => {
                    console.log("DB saved chat data!");
                    return ref.once('value');
                }).then(snapshot => {
                    console.log("DB returned chat snapshot");
                    let val = snapshot.val();
                    resolve(val);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }

    removeChatWithUser(uid): Promise<any> {
        console.log("Creating chat with user...");
        return new Promise((resolve, reject) => {
            var chatId = this.chatIdWith(uid);
            let ref = firebase.database().ref('/chats/' + chatId);
                ref.remove().then(success => {
                    console.log("DB removed chat data!");
                    resolve(success);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
        });
        
    }

    observeChats() {
        console.log("Observing chats...");
        let ref = firebase.database().ref('/chats/').orderByChild('users/' + this.userS.user.id);
        ref.on('value', (snapshot) => {
            snapshot = snapshot.val();
            console.log("Chats returned by DB:");
            console.log(snapshot);
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
                        console.log(chats);
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
                        console.log(chats);
                        this.fetchUnreadCount();
                    }
                });
            }
        });
    }

    fetchUnreadCount(): Promise<any> {
        console.log("Fetching unread count for chats...");
        return new Promise((resolve, reject) => {
            var chats = [];
            var chatCount = 0;
            var totalUnreadCount = 0;
            for (var key in this.chats) {
                let chat = this.chats[key];
                console.log(this.chats);
                console.log(chat);
                this.fetchUnreadCountIn(chat).then(unreadCount => {
                    if (unreadCount) {
                        chat['unreadCount'] = unreadCount;
                        totalUnreadCount += unreadCount;
                    }
                    chats.push(chat);
                    chatCount++;
                    if (chatCount == chats.length) {
                        chats.sort(function(a, b){
                            return a.timestamp-b.timestamp;
                        });
                        this.chats = chats;
                        this.unreadCount = totalUnreadCount;
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
                        this.unreadCount = totalUnreadCount;
                    }
                });
            }
        });
    }

    fetchUnreadCountIn(chat): Promise<number> {
        console.log("Fetching unread count...");
        return new Promise((resolve, reject) => {
            let userStamp: any;
            for (var uid in chat.users) {
                if (uid == this.userS.user.id) {
                    userStamp = chat.users[uid];
                }
            }
            let ref = firebase.database().ref('/messages/'+ chat.id).orderByChild('timestamp').startAt(userStamp);
            ref.once('value').then(snap => {
                if (snap.exists()) {
                    console.log("Found unread count!");
                    console.log(snap.numChildren());
                    console.log(snap.val());
                    resolve(snap.numChildren());
                } else {
                    console.log("No unread count found!");
                    resolve(null);
                }
            }).catch(error => {
                console.log(error);
                reject(null);
            });
        });
    }
    
    stopObservingChats() {
        console.log("Stopped observing chats...");
        firebase.database().ref('/chats/').off()
    }

    observeMessagesIn(chat) {
        console.log("Observing messages...");
        return new Observable(observer => {
            let ref = firebase.database().ref('messages/' + chat.id);
            ref.on('value', (snapshot) => {
                console.log(snapshot.val());
                observer.next(snapshot.val());
            });
        });
    }

    stopObservingMessagesIn(chat) {
        console.log("Stopped observing messages...");
        firebase.database().ref('/messages/' + chat.id).off()
    }

    sendMessageTo(message, user): Promise<any> {
        console.log("Sending message...");
        return new Promise((resolve, reject) => {
            var chatId = this.chatIdWith(user.id);
            var now = (new Date).getTime();
            var val = { "message" : message, "timestamp" : now, "sender" : this.userS.user.id };
            var data = {};
            data[now] = val;
            let ref = firebase.database().ref('/messages/' + chatId);
            ref.update(data).then(data => {
                console.log("DB saved message data!");
                return ref.once('value');
            }).then(snapshot => {
                console.log("DB returned message snapshot");
                var chatVal = { "lastMessage" : message, "timestamp" : now, "id" : chatId };
                let chatRef = firebase.database().ref('/chats/' + chatId);
                chatRef.update(chatVal).then(chatData => {
                    console.log("DB saved chat data!");
                    return chatRef.once('value');
                }).then(chatSnap => {
                    console.log("DB returned chat snapshot");
                    resolve(snapshot.val());
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            }).catch(error => {
                console.log(error);
                reject(error);
            });
        });
    }

    sendAttachmentTo(user, url): Promise<any> {
        console.log("Uploading attachment...");
        return new Promise((resolve, reject) => {
            var chatId = this.chatIdWith(user.id);
            var now = new Date().getTime();
            var val = { "url" : url, "timestamp" : now, "sender" : this.userS.user.id };
            var data = {};
            data[now] = val;
            let ref = firebase.database().ref('/messages/' + chatId);
            ref.update(data).then(data => {
                console.log("DB saved image url data!");
                return ref.once('value');
            }).then(snapshot => {
                console.log("DB returned image url snapshot");
                var chatVal = { "lastMessage" : user.firstName + ' sent an image.', "timestamp" : now, "id" : chatId };
                let chatRef = firebase.database().ref('/chats/' + chatId);
                chatRef.update(chatVal).then(chatData => {
                    console.log("DB saved chat data!");
                    return chatRef.once('value');
                }).then(chatSnap => {
                    console.log("DB returned chat snapshot");
                    resolve(snapshot.val());
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
            }).catch(error => {
                console.log(error);
                reject(error);
            });
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