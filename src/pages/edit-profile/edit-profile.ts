import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController, LoadingController } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { UserService } from '../../providers/user-service';
import { FbService } from '../../providers/fb-service';
import { StorageService } from '../../providers/storage-service';
import { PopoverService } from '../../providers/popover-service';
import { ModalService } from '../../providers/modal-service';

import { PopoverPage } from '../popover/popover';
import { PhotoSelectPage } from '../photo-select/photo-select';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
    images: Array<any>;
    keys: Array<any>;
    user: any;
    constructor(private navCtrl: NavController,
                private actionSheetCtrl: ActionSheetController,
                private alertCtrl: AlertController,
                private loadingCtrl: LoadingController,
                private userS: UserService,
                private fbS: FbService,
                private storageS: StorageService,
                private popoverS: PopoverService,
                private modalS: ModalService) {
        this.user = this.userS.user;
    }
    
    ionViewWillEnter() {
        this.fetchUserImages();
    }
    
    fetchUserImages() {
        this.storageS.fetchImagesFor(this.userS.user.id).then(snap => {
            let urlList = [];
            let keyList = [];
            snap.forEach(snapshot => {
                console.log(snapshot.key);
                urlList.push(snapshot.val());
                keyList.push(snapshot.key);
            })
            this.images = urlList;
            this.keys = keyList;
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
                this.userS.updateUser(this.user);
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
                this.userS.updateUser(this.user);
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
                this.userS.updateUser(this.user);
            }
        });
        this.popoverS.present();
    }

    editProfileSubmit() {
        console.log("Changes made, updating user in database!");
        this.user.age = this.getAge();
        this.user.instagram = this.user.instagram.replace(/\W+/g, '');
        this.userS.updateUser(this.user);
    }

    getAge() {
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
        return age;
    }

    presentPhotoOptions(): Promise<any> {
        return new Promise((resolve, reject) => {
            let actionSheet = this.actionSheetCtrl.create({
            title: 'Select Image Source',
            cssClass: 'action-sheet',
            buttons: [
                {
                text: 'Facebook',
                handler: () => {
                    this.fetchFacebookPhotos().then(url => {
                        resolve(url);
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                }
                },
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
                saveToPhotoAlbum: false,
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

    fetchFacebookPhotos(): Promise<any> {
        return new Promise((resolve, reject) => {
            let loading = this.loadingCtrl.create({
                content: 'Fetching Facebook albums...'
            });
            loading.present();
            this.fbS.callFacebookPhotoAPI().then(albums => {
                loading.dismiss();
                console.log(albums);
                if (albums) {
                    this.modalS.albums = albums;
                    this.modalS.create(PhotoSelectPage);
                    this.modalS.modal.onDidDismiss(url => {
                        if (url) {
                            let loading = this.loadingCtrl.create({
                                content: 'Fetching image...'
                            });
                            loading.present();
                            console.log("Fetching selected image file...");
                            var img = new Image();
                            img.setAttribute('crossOrigin', 'anonymous');
                            img.onload = function () {
                                var canvas = document.createElement("canvas");
                                canvas.width = this.width;
                                canvas.height = this.height;

                                var ctx = canvas.getContext("2d");
                                ctx.drawImage(this, 0, 0);
                                
                                let data = canvas.toDataURL("image/png");
                                console.log(data);
                                var base64String = data.split('base64,')[1];               
                                console.log(base64String);
                                resolve(base64String);
                                loading.dismiss();
                            };
                            img.src = url;
                        } else {
                            resolve(null);
                        }
                    });
                    this.modalS.present();
                } else {
                    let alert = this.alertCtrl.create({
                        title: 'No albums found!',
                        message: 'Please check your app permissions in Facebook settings and log in again.',
                        buttons: ['Dismiss']
                    });
                    alert.present();
                }
            }).catch(error => {
                loading.dismiss();
                console.log(error);
                reject(error);
            });
        });
    }
    
    uploadProfileImage() {
        let env = this;
        this.presentPhotoOptions().then(imageData => {
            if (imageData) {
                let loading = this.loadingCtrl.create({
                    content: 'Uploading image...'
                });
                loading.present();
                env.storageS.uploadProfileImageFor(env.userS.user.id, imageData).then(url => {
                    env.user['photoURL'] = url;
                    env.userS.updateCurrentUser(env.user);
                    loading.dismiss();
                }).catch(error => {
                    console.log(error);
                    loading.dismiss();
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    
    uploadImage() {
        let env = this;
        this.presentPhotoOptions().then(imageData => {
            if (imageData) {
                let loading = this.loadingCtrl.create({
                    content: 'Uploading image...'
                });
                loading.present();
                env.storageS.uploadImageFor(env.userS.user.id, imageData).then(url => {
                    env.images.push(url);
                    loading.dismiss();
                }).catch(error => {
                    console.log(error);
                    loading.dismiss();
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    deleteImage(index) {
        var key = this.keys[index];
        console.log("Deleting image with key:", key);
        this.storageS.removeImageFor(this.userS.user.id, key);
        this.images[index] = null;
    }

}