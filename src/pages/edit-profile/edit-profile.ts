import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { UserService } from '../../providers/user-service';
import { StorageService } from '../../providers/storage-service';
import { PopoverService } from '../../providers/popover-service';

import { PopoverPage } from '../popover/popover';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    images: Array<any>;
    user: any;
    constructor(private navCtrl: NavController,
                private actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController,
                private userS: UserService,
                private storageS: StorageService,
                private popoverS: PopoverService) {
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

    selectFeet() {
        this.popoverS.create(PopoverPage);
        this.popoverS.options = ['2', '3', '4', '5', '6', '7', '8'];
        this.popoverS.popover.onDidDismiss(feet => {
            if (feet) {
                console.log("Feet selected!");
                console.log(this.user.heightFt);
                this.user.heightFt = feet;
                console.log(this.user.heightFt);
            }
        });
        this.popoverS.present();
    }

    selectInches() {
        this.popoverS.create(PopoverPage);
        this.popoverS.options = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        this.popoverS.popover.onDidDismiss(inches => {
            if (inches) {
                console.log("Feet selected!");
                console.log(this.user.heightFt);
                this.user.heightIn = inches;
                console.log(this.user.heightFt);
            }
        });
        this.popoverS.present();
    }

    selectReligion() {
        this.popoverS.create(PopoverPage);
        this.popoverS.options = ['Christian', 'Catholic', 'Muslim (Sunni)', 'Muslim (Shiite)', 'Baha\'i', 'Jewish (Orthodox)', 'Jewish (Conservative)', 'Other'];
        this.popoverS.popover.onDidDismiss(religion => {
            if (religion) {
                console.log("Religion selected!");
                console.log(this.user.religion);
                this.user.religion = religion;
                console.log(this.user.religion);
            }
        });
        this.popoverS.present();
    }

    editProfileSubmit() {
        console.log("Save pressed!");
        let splitBDay = this.user.birthday.split('-');
        var year = parseInt(splitBDay[0]);
        var month = parseInt(splitBDay[1]);
        var day = parseInt(splitBDay[2]);

        let today = new Date();
        let age = today.getFullYear() - year;
        if ( today.getMonth() < (month - 1) ) {
            age--;
        } else if (((month - 1) == today.getMonth()) && (today.getDate() < day)) {
            age--;
        }

        this.user.age = age;
        this.userS.updateUser(this.user);
        
        let alert = this.alertCtrl.create({
            title: 'Done!',
            subTitle: 'Your changes have been saved.',
            buttons: ['Dismiss']
        });
        alert.present();
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

    deleteImage(index) {
        this.storageS.removeImageFor(this.userS.user.id, index);
        this.images[index] = null;
    }

}