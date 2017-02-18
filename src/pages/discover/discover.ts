import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { DiscoverService } from '../../providers/discover-service';
import { ChatsPage } from '../chats/chats';
 
import {
  StackConfig,
  Stack,
  Card,
  ThrowEvent,
  DragEvent,
  SwingStackComponent,
  SwingCardComponent } from 'angular2-swing';

@Component({
    selector: 'page-discover',
    templateUrl: 'discover.html'
})
export class DiscoverPage {
    @ViewChild('swingContainer') swingStack: SwingStackComponent;
    @ViewChildren('cardsContainer') swingCards: QueryList<SwingCardComponent>;
    
    users: Array<any>;
    loadedUsers: Array<any>;
    loadedUsersIndex: 0;
    stackConfig: StackConfig;
  
    constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, private discoverS: DiscoverService) {
      this.stackConfig = {
        throwOutConfidence: (offset, element) => {
          return Math.min(Math.abs(offset) / (element.offsetWidth/2), 1);
        },
        transform: (element, x, y, r) => {
          this.onItemMove(element, x, y, r);
        },
        throwOutDistance: (d) => {
          return 800;
        }
      };
    }
    
    ionViewDidLoad() {
        // Either subscribe in controller or set in HTML
        this.swingStack.throwin.subscribe((event: DragEvent) => {
	       event.target.style.background = '#fff';
        });
	}
    
    ionViewWillEnter() {
        console.log("Entered discover page");
        this.fetchUsers();
    }
    
    openChats() {
        this.navCtrl.push(ChatsPage);
    }
    
    presentToast(message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 500,
            position: 'top'
        });
        toast.present();
    }
    
    fetchUsers() {
        console.log("fetching global users");
        this.discoverS.fetchGlobalUsers().then(data => {
            console.log("fetch returned global users");
            console.log(data);
            this.users = data;
            this.loadedUsers = [];
            this.loadedUsers.push(this.users[this.loadedUsersIndex]);
            this.loadedUsersIndex++;
            this.loadedUsers.push(this.users[this.loadedUsersIndex]);
            this.loadedUsersIndex++;
        }).catch(error => {
            alert(error);
        });
    }
    
    swipeLeft() {
        console.log("Swiping left...");
        console.log(this.loadedUsersIndex);
        console.log(this.users.length);
        if (this.loadedUsersIndex < this.users.length) {
            let currentCard = this.loadedUsers.pop();
            console.log(currentCard);
            this.discoverS.seen(currentCard.id).then(success => {
                this.presentToast('You did not like: ' + currentCard.firstName);
                this.loadedUsers.push(this.users[this.loadedUsersIndex]);
                this.loadedUsersIndex++;
            }).catch(error => {
                this.presentToast('Error saving swipe');
            });
        }
    }
    
	swipeRight() {
        console.log("Swiping right...");
        console.log(this.loadedUsersIndex);
        console.log(this.users.length);
        if (this.loadedUsersIndex < this.users.length) {
            let currentCard = this.loadedUsers.pop();
            console.log(currentCard);
            this.discoverS.seen(currentCard.id).then(success => {
                this.discoverS.like(currentCard.id).then(success => {
                    this.presentToast('You liked: ' + currentCard.firstName);
                    this.loadedUsers.push(this.users[this.loadedUsersIndex]);
                    this.loadedUsersIndex++;
                }).catch(error => {
                    this.presentToast('Error saving swipe');
                });
            }).catch(error => {
                this.presentToast('Error saving swipe');
            });
        }
	}
    
    doubleLike() {
        this.presentToast("double like!" + this.users[0].id );
        
    }
    
    undo() {
        this.presentToast("undo!");
    }

    // Called whenever we drag an element
	onItemMove(element, x, y, r) {
	  var color = '';
	  var abs = Math.abs(x);
	  let min = Math.trunc(Math.min(16*16 - abs, 16*16));
	  let hexCode = this.decimalToHex(min, 2);
	  
	  if (x < 0) {
	    color = '#FF' + hexCode + hexCode;
	  } else {
	    color = '#' + hexCode + 'FF' + hexCode;
	  }
	  
	  element.style.background = color;
	  element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
	}

	// http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
	decimalToHex(d, padding) {
	  var hex = Number(d).toString(16);
	  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
	  
	  while (hex.length < padding) {
	    hex = "0" + hex;
	  }
	  
	  return hex;
	}
}
