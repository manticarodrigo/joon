import { Injectable } from '@angular/core';

import { AngularFire, AuthProviders, AngularFireAuth, FirebaseAuthState, AuthMethods } from 'angularfire2';

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

    signInWithFacebook(): firebase.Promise<FirebaseAuthState> {
        return this.auth$.login({
            provider: AuthProviders.Facebook,
            method: AuthMethods.Popup,
            scope: ['user_friends', 'user_birthday', 'user_about_me', 'user_hometown', 'user_location', 'user_religion_politics', 'user_education_history', 'user_work_history']
        });
    }

    signOut(): void {
        this.auth$.logout();
    }
    
    getUID(): string {
        return this.authState.facebook.uid;
    }
    
    getVal() {
        return this.authState.facebook;
    }
}
