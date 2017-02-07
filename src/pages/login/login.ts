import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from '../../providers/auth-service';
import { UserService } from '../../providers/user-service';
import { DiscoverPage } from '../discover/discover';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
    
    constructor(public navCtrl: NavController,
                private auth: AuthService,
                private userService: UserService,
                private http: Http) {
    }
    
    signInWithFacebook(): void {
        this.auth.signInWithFacebook()
            .then(() => this.onSignInSuccess());
    }

    private onSignInSuccess(): void {
        let uid = this.auth.getUID();
        let val = this.auth.getVal();
        this.userService.addUserByUID(uid, val);
        this.userService.setCurrentUserUID(uid);
        // Pop to landing page!

        // this.http.get('https://graph.facebook.com/me?access_token=' + val.accessToken)
        //     .map(data => data.json().results)
        //     .subscribe(result => {
        //         for (let val of result) {
        //             if (val["dob"]) {
        //                 var age = val["dob"].split(" ")[0];
        //                 var year = age.split('-')[0];
        //                 var month = age.split('-')[1];
        //                 var day = age.split('-')[2];
                        
        //                 var today = new Date();
        //                 age = today.getFullYear() - year;
        //                 if ( today.getMonth() < (month - 1)) {
        //                     age--;
        //                 }
        //                 if (((month - 1) == today.getMonth()) && (today.getDate() < day)) {
        //                     age--;
        //                 }
        //                 val["age"] = age;
        //             }
        //             this.user = val;
        //             for (var i=0; i<3; i++) {
        //                 this.users.push(this.user);
        //             }
        //         }
        // });


        this.navCtrl.pop();
    }

}