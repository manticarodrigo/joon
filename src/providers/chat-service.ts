import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from "rxjs/Observable";
import firebase from 'firebase';

import { UserService } from './user-service';

@Injectable()
export class ChatService {

    constructor(private userS: UserService) {
        
    }
  
    chatWith(user): Promise<any> {
        console.log("Chatting with user...");
        return new Promise((resolve, reject) => {
            let chatId = this.chatIdWith(user.id);
            this.fetchChat(chatId).then(chat => {
                if (chat) {
                    resolve(chat);
                } else {
                    this.createChatWithUser(user.id).then(chat => {
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
                var now = (new Date).getTime();
                var val = { "lastMessage" : lastMessage, "timestamp" : now, "id" : chatId };
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
    
}
    
    /*
    static func userForChat(_ chat: Chat, completion: @escaping (_ user: User?) -> Void ) {
        FirebaseController.dataAtEndpoint("/chats/\(chat.identifier!)/users/") { (data) -> Void in
            if let json = data as? [String: AnyObject] {
                for userJson in json {
                    if userJson.0 != UserController.shared.currentUser.identifier! {
                        UserController.userWithIdentifier(userJson.0, completion: { (user) -> Void in
                            if let user = user {
                                completion(user)
                            } else {
                                completion(nil)
                            }
                        })
                    }
                }
            } else {
                completion(nil)
            }
        }
    }
    
    static func observeChatsForUser(_ user: User, completion: @escaping (_ chats: [Chat]?, _ users: [User?]?) -> Void) {
        FirebaseController.base.child("chats").queryOrdered(byChild: "users/\(user.identifier!)").queryEqual(toValue: true).observe(.value, with: { snapshot in
            if let chatDictionaries = snapshot.value as? [String: AnyObject] {
                let chats = orderChats(chatDictionaries.flatMap({Chat(json: $0.1 as! [String : AnyObject], identifier: $0.0)}))
                var users = [User?]()
                var chatCount = 0
                for chat in chats {
                    ChatController.userForChat(chat) { (user) in
                        if let user = user {
                            users.append(user)
                        } else {
                            users.append(nil)
                        }
                        chatCount += 1
                        if chatCount == chats.count {
                            completion(chats, users)
                        }
                    }
                }
            } else {
                completion(nil, nil)
            }
        })
    }
    
    static func stopObservingChats(_ chats: [Chat]) {
        for chat in chats {
            FirebaseController.base.child("chats/\(chat.identifier!)").removeAllObservers()
        }
    }
    
    static func observeTypingIn(_ chat: Chat, completion: @escaping (_ users: [User]?) -> Void) {
        FirebaseController.observeDataAtEndpoint("chats/\(chat.identifier!)/typing") { (data) in
            if let json = data as? [String: AnyObject] {
                var users = [User]()
                var userCount = 0
                for userDict in json {
                    UserController.userWithIdentifier(userDict.0, completion: { (user) -> Void in
                        if let user = user {
                            if user != UserController.shared.currentUser! {
                                users.append(user)
                            }
                            userCount += 1
                            if userCount == data?.count {
                                if users.count > 0 {
                                    completion(users)
                                } else {
                                    completion(nil)
                                }
                            }
                        } else {
                            userCount += 1
                            if userCount == data?.count {
                                if users.count > 0 {
                                    completion(users)
                                } else {
                                    completion(nil)
                                }
                            }
                        }
                    })
                }
            } else {
                completion(nil)
            }
        }
    }
    
    static func stopObservingChat(_ chat: Chat) {
        FirebaseController.base.child("chats/\(chat.identifier!)").removeAllObservers()
        FirebaseController.base.child("messages/\(chat.identifier!)").removeAllObservers()
        FirebaseController.base.child("chats/\(chat.identifier!)/typing").removeAllObservers()
    }
    
    static func userIsTypingInChat(_ typing: Bool, chat: Chat) {
        let endpoint = "chats/\(chat.identifier!)/typing/\(UserController.shared.currentUser.identifier!)"
        let userIsTypingRef = FirebaseController.base.child(endpoint)
        if typing {
            userIsTypingRef.setValue(true)
        } else {
            userIsTypingRef.removeValue()
        }
        userIsTypingRef.onDisconnectRemoveValue()
    }
    
    static func sendMessageToCourse(_ text: String, chat: Chat, course: Course, completion: @escaping (_ message: Message?) -> Void) {
        let timestamp = NSNumber(integerLiteral: Int(NSDate().timeIntervalSince1970))
        if let currentUser = UserController.shared.currentUser {
            let message = Message(text: text, sender: currentUser.identifier!, timestamp: timestamp, read: false, identifier: nil)
            FirebaseController.base.child("messages/\(chat.identifier!)").childByAutoId().setValue(message.jsonValue) { (error, ref) in
                if error == nil {
                    let lastMessage = "\(currentUser.firstName()): \(message.text)"
                    var chat = Chat(lastMessage: lastMessage, timestamp: timestamp, typing: chat.typing, unread: chat.unread, identifier: chat.identifier!)
                    chat.save()
                    self.updateCourseChat(course, chat: chat)
                    completion(message)
                } else {
                    completion(nil)
                }
            }
        }
    }
    
    static func updateCourseChat(_ course: Course, chat: Chat) {
        CourseController.usersForCourse(course) { (users) in
            if let users = users {
                for user in users {
                    if let currentUser = UserController.shared.currentUser, user != currentUser {
                        if let unreadCount = chat.unread?[user.identifier!] as? Int {
                            FirebaseController.base.child("chats/\(chat.identifier!)/unread").updateChildValues([user.identifier! : unreadCount + 1])
                        } else {
                            FirebaseController.base.child("chats/\(chat.identifier!)/unread").updateChildValues([user.identifier! : 1])
                        }
                    }
                }
            }
        }
    }
    
    static func readMessageInChat(_ message: Message, chat: Chat, completion: @escaping (_ message: Message?) -> Void) {
        if let currentUser = UserController.shared.currentUser, message.sender != currentUser.identifier! {
            FirebaseController.base.child("messages/\(chat.identifier!)/\(message.identifier!)").updateChildValues(["read" : true], withCompletionBlock: { (error, ref) in
                if error == nil {
                    var readMessage = message
                    readMessage.read = true
                    completion(readMessage)
                } else {
                    completion(nil)
                }
            })
        } else {
            completion(nil)
        }
    }
    
    static func orderChats(_ chats: [Chat]) -> [Chat] {
        return chats.sorted(by: {TimeInterval($0.0.timestamp) > TimeInterval($0.1.timestamp)})
    }
    */

