import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { ChatsPage } from '../chats/chats';
import { Http } from '@angular/http';
import 'rxjs/Rx';

import { AngularFire, FirebaseListObservable } from 'angularfire2';
 
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
    
    cards: Array<any>;
    stackConfig: StackConfig;
  
    constructor(public navCtrl: NavController, private http: Http, public navParams: NavParams, public toastCtrl: ToastController, af: AngularFire) {
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
  
    openChats() {
        this.navCtrl.push(ChatsPage);
    }
    
    ngAfterViewInit() {
        // Either subscribe in controller or set in HTML
        this.swingStack.throwin.subscribe((event: DragEvent) => {
	       event.target.style.background = '#000';
        });
	  
        this.cards = [{email: ''}];
        this.addNewCards(1);
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

	// Connected through HTML
	voteUp(like: boolean) {
        let currentCard = this.cards.pop();
        if (like) {
	       this.presentToast('You liked: ' + currentCard.name.first);
            //currentCard.throwOut(800, 500);
        } else {
	       this.presentToast('You ignored: ' + currentCard.name.first);
            //currentCard.throwOut(-800, 500);
        }
        this.addNewCards(1);
	}
    
    
    
    presentToast(message) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 500,
            position: 'top'
        });
        toast.present();
    }

	// Add new cards to our array
	addNewCards(count: number) {
	  this.http.get('https://randomuser.me/api/?results=' + count)
	  .map(data => data.json().results)
	  .subscribe(result => {
	    for (let val of result) {
            if (val["dob"]) {
                        var age = val["dob"].split(" ")[0];
                        var year = age.split('-')[0];
                        var month = age.split('-')[1];
                        var day = age.split('-')[2];
                        
                        var today = new Date();
                        age = today.getFullYear() - year;
                        if ( today.getMonth() < (month - 1)) {
                            age--;
                        }
                        if (((month - 1) == today.getMonth()) && (today.getDate() < day)) {
                            age--;
                        }
                        val["age"] = age;
                    }
	      this.cards.push(val);
	    }
	  })
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
