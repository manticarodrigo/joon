import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
    
    viewState = "";
    chatInput = "";
    selectedUser: any;
    user: '';

    constructor(private nav: NavController, navParams: NavParams) {
        // If we navigated to this page, we will have an item available as a nav param
        this.user = navParams.get('user');
        this.viewState = "messages";
    }
    
    attach() {
        console.log('attach');
    }
    
    send(message) {
        console.log(message);
    }

}