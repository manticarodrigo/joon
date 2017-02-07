import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

@Injectable()
export class StorageService {
    
    storageRef = firebase.storage().ref(); 
    
    constructor() {
    }
    
    uploadImageFor(UID, data) {
        
    }
    
    uploadProfileImageFor(UID, data) {
        this.storageRef.child(UID + '/image.png').put(data).then(snapshot => console.log(snapshot));
        
        // TODO: return snapshot.downloadURL
    }
    
    downloadImagesFor(UID) {
        
    }
    
    downloadProfileImageFor(UID) {
        this.storageRef.child(UID + '/image.png').getDownloadURL().then(url => console.log(url));
    }

}