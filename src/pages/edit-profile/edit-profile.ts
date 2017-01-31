import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/Rx';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    user = '';
    mutual: Array<any>;

    constructor(public navCtrl: NavController, private http: Http) {
    
    }
    
    ngAfterViewInit() {
        this.generateRandomUser();
        this.mutual = [];
        
	}

    generateRandomUser() {
        this.http.get('https://randomuser.me/api/?results=' + 1)
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
                    this.user = val;
                    for (var i=0; i<3; i++) {
                        this.mutual.push(this.user);
                    }
                }
        })
    }

}