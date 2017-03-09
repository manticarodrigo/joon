import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    images: Array<any>;
    user: any;
    constructor(private navCtrl: NavController,
                private actionSheetCtrl: ActionSheetController,
                private userS: UserService,
                private storageS: StorageService) {
        this.user = this.userS.user;
    }
    
    ionViewWillEnter() {
        this.fetchUserImages();
    }
    
    fetchUserImages() {
        this.storageS.fetchImagesFor(this.userS.user.id).then(urlList => {
            this.images = urlList;
        });
    }

    editProfileSubmit() {
        console.log("Save pressed!");
        this.userS.updateUser(this.userS.user);
    }

    presentPhotoOptions(): Promise<any> {
        return new Promise((resolve, reject) => {
            let actionSheet = this.actionSheetCtrl.create({
            title: 'Select Image Source',
            cssClass: 'action-sheet',
            buttons: [
                {
                text: 'Photo Library',
                handler: () => {
                    this.takePicture(Camera.PictureSourceType.PHOTOLIBRARY).then(imageData => {
                        resolve(imageData);
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                }
                },
                {
                text: 'Camera',
                handler: () => {
                    this.takePicture(Camera.PictureSourceType.CAMERA).then(imageData => {
                        resolve(imageData);
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                }
                },
                {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                    resolve(null);
                }
                }
            ]
            });
            actionSheet.present();
        });
    }

    takePicture(sourceType): Promise<any> {
        return new Promise((resolve, reject) => {
            // Create options for the Camera Dialog
            var options = {
                quality: 100,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType: sourceType,
                allowEdit : true,
                encodingType: Camera.EncodingType.PNG,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: true,
                correctOrientation: true
            };
            
            // Get the data of an image
            Camera.getPicture(options).then((imageData) => {
                resolve(imageData);
            }, (error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    
    uploadProfileImage() {
        let env = this;
        this.presentPhotoOptions().then(imageData => {
            if (imageData) {
                env.storageS.uploadProfileImageFor(env.userS.user.id, imageData).then(url => {
                    env.user['photoURL'] = url;
                    env.userS.updateCurrentUser(env.user);
                }).catch(error => {
                    console.log(error);
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    
    uploadImage(index) {
        let env = this;
        this.presentPhotoOptions().then(imageData => {
            if (imageData) {
                env.storageS.uploadImageFor(env.userS.user.id, imageData, index).then(url => {
                    env.images[index] = url;
                }).catch(error => {
                    console.log(error);
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }

}