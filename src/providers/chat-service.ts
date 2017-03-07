import { Injectable, NgZone } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";
import firebase from 'firebase';

import { UserService } from './user-service';
import { DiscoverService } from './discover-service';

@Injectable()
export class ChatService {

    chats: Array<any>;
    matchedUsers: Array<any>;
    unreadCount = 0;

    constructor(private zone: NgZone,
                private userS: UserService) {

    }
  
    chatWith(user): Promise<any> {
        console.log("Chatting with user...");
        return new Promise((resolve, reject) => {
            let chatId = this.chatIdWith(user);
            this.fetchChat(chatId).then(chat => {
                if (chat) {
                    chat['user'] = user;
                    this.updateUserActivityIn(chat);
                    resolve(chat);
                } else {
                    this.createChatWithUser(user).then(chat => {
                        if (chat) {
                            chat['user'] = user;
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
    
    chatIdWith(user) {
        var chatId = '';
            if (this.userS.user.id < user.id) {
                chatId = this.userS.user.id + "_" + user.id;
            } else {
                chatId = user.id + "_" + this.userS.user.id;
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
        
    private createChatWithUser(user): Promise<any> {
        console.log("Creating chat with user...");
        return new Promise((resolve, reject) => {
            var chatId = this.chatIdWith(user);
            var lastMessage = "Tap to say hello!";
            var now = new Date().getTime();
            var users = {};
            users[user.id] = new Date().getTime();
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
        });
    }

    removeChatWith(user): Promise<any> {
        console.log("Creating chat with user...");
        return new Promise((resolve, reject) => {
            var chatId = this.chatIdWith(user);
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

    fetchMatchedUsers(): Promise<any> {
        console.log("Fetching matched users...");
        return new Promise((resolve, reject) => {
            let user = this.userS.user;
            let ref = firebase.database().ref('/user_matches/' + user.id);
            ref.once('value').then(snapshot => {
                console.log('Fetched user matches:');
                console.log(snapshot.val());
                let val = snapshot.val();
                var users = [];
                var userCount = 0;
                for (var uid in val) {
                    this.userS.fetchUser(uid).then(user => {
                        users.push(user);
                        userCount++
                        let numUsers = snapshot.numChildren();
                        if (userCount == numUsers) {
                            console.log("Fetch returned matched users:", users);
                            resolve(users);
                        }
                    }).catch(error => {
                        console.log(error);
                        let numUsers = snapshot.numChildren();
                        if (userCount == numUsers) {
                            console.log("Fetch returned matched users:", users);
                            resolve(users);
                        }
                    });
                }
            }).catch(error => {
                console.log(error);
                reject(error);
            })
        });
    }

    userFor(chat) {
        for (var uid in chat.users) {
            if (uid != this.userS.user.id) {
                for (var key in this.matchedUsers) {
                    var user = this.matchedUsers[key];
                    if (uid == user.id) {
                        return user
                    }
                }
                return null
            }
        }
    }

    newUserFor(chat) {
        for (var uid in chat.users) {
            if (uid != this.userS.user.id) {
                this.userS.fetchUser(uid).then(user => {
                    chat['user'] = user;
                    this.chats.push(chat);
                    this.fetchUnreadCount();
                }).catch(error => {
                    console.log(error);
                });
            }
         }
    }

    observeChats() {
        console.log("Observing chats...");
        this.fetchMatchedUsers().then(matchedUsers => {
            this.matchedUsers = matchedUsers;
            let ref = firebase.database().ref('/chats/').orderByChild('users/' + this.userS.user.id).startAt(0);
            ref.on('value', (snapshot) => {
                let val = snapshot.val();
                console.log("Chats returned from DB:", val);
                var chats = [];
                for (var key in val) {
                    var chat = val[key];
                    if (this.userFor(chat)) {
                        chat['user'] = this.userFor(chat);
                        chats.push(chat);
                    } else {
                        console.log("Didn't find user for chat:", chat);
                        this.newUserFor(chat);
                    }
                }
                this.zone.run(() => {
                    this.chats = chats;
                    this.updateTime();
                    console.log("Set chats: ", chats);
                    this.fetchUnreadCount();
                });
            });
        }).catch(error => {
            console.log(error);
        });
    }

    updateTime() {
        console.log("Updating time for chats...");
        for (var key in this.chats) {
            this.chats[key]['time'] = this.getTimeStringFrom(this.chats[key].timestamp);
        }
        this.chats.sort(function(a, b){
            return b.timestamp-a.timestamp;
        });
    }

    fetchUnreadCount() {
        console.log("Fetching unread count for chats...");
        var chatCount = 0;
        var totalUnreadCount = 0;
        for (var key in this.chats) {
            this.fetchUnreadCountIn(this.chats[key]).then(unreadCount => {
                if (unreadCount) {
                    this.chats[key]['unreadCount'] = unreadCount;
                    totalUnreadCount += unreadCount;
                }
                chatCount++;
                if (chatCount == this.chats.length) {
                    this.zone.run(() => {
                        this.unreadCount = totalUnreadCount;
                        this.updateTime();
                    });
                }
            }).catch(error => {
                console.log(error);
                chatCount++;
                if (chatCount == this.chats.length) {
                    this.zone.run(() => {
                        this.unreadCount = totalUnreadCount;
                        this.updateTime();
                    });
                }
            });
        }
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
        firebase.database().ref('/chats/').off();
    }

    observeMessagesIn(chat) {
        console.log("Observing messages...");
        return new Observable(observer => {
            let ref = firebase.database().ref('messages/' + chat.id);
            ref.on('child_added', (snapshot) => {
                console.log(snapshot.val());
                this.zone.run(() => {
                    observer.next(snapshot.val());
                });
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
            var chatId = this.chatIdWith(user);
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
            var chatId = this.chatIdWith(user);
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
        if (interval >= 1) {
            return time;
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
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