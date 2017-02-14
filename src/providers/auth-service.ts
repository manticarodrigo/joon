import { Injectable } from '@angular/core';
import { AngularFire, AuthProviders, AngularFireAuth, FirebaseAuthState, AuthMethods } from 'angularfire2';
import { Facebook } from 'ionic-native';
import firebase from 'firebase';

@Injectable()
export class AuthService {
    
    private authState: FirebaseAuthState;

    constructor(public auth$: AngularFireAuth, private af: AngularFire) {
        this.authState = auth$.getAuth();
        auth$.subscribe((state: FirebaseAuthState) => {
            this.authState = state;
        });
    }

    get authenticated(): boolean {
        return this.authState !== null;
    }
    
    facebookLogin(): Promise<any> {
        return new Promise((resolve, reject) => {
            Facebook.login(['email', 'user_friends', 'user_birthday', 'user_about_me', 'user_hometown', 'user_location', 'user_religion_politics', 'user_education_history', 'user_work_history']).then(
            (response) => {
            let facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
            firebase.auth().signInWithCredential(facebookCredential).then((success) => {
                    // alert("Firebase success: " + JSON.stringify(success));
                    resolve(success);
                }).catch((error) => {
                    // alert("Firebase failure: " + JSON.stringify(error));
                    reject(error);
                });
            },
            (error) => { reject(error); });
        });
    }

    signInWithFacebook(): firebase.Promise<FirebaseAuthState> {
        return this.auth$.login({
            provider: AuthProviders.Facebook,
            method: AuthMethods.Popup,
            scope: ['user_friends', 'user_birthday', 'user_about_me', 'user_hometown', 'user_location', 'user_religion_politics', 'user_education_history', 'user_work_history']
        });
    }

    signOut() {
        firebase.auth().signOut();
        Facebook.logout();
    }
    
    getUID(): string {
        return this.authState.facebook.uid;
    }
    
    getVal() {
        return this.authState.facebook;
    }
}
