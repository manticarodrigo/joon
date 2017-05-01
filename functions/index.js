var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// exports.fetchDiscoverables = functions.https.onRequest((req, res) => {
//     // Grab the uid parameter.
//     const uid = req.query.uid;
//     console.log("Got uid paramter: " + uid);
//     return new Promise((resolve, reject) => {
//         Promise.all([
//             admin.database().ref('/users/' + uid).once('value'),
//             admin.database().ref('/users').once('value'),
//             admin.database().ref('/user_saw/' + uid).once('value'),
//             admin.database().ref('/user_preferences/' + uid).once('value')
//         ])
//         .then(snapshots => {
//             const currentUser = snapshots[0].val();
//             console.log("Sorting discoverable users for " + currentUser.name);
//             const allUsers = snapshots[1];
//             const seenUIDS = snapshots[2].val();
//             const pref = snapshots[3].val();
//             let visibleUsers = [];
//             // this method for parsing out seenUIDs is not totally optimal
//             // - better to remove keys when both are dictionaries
//             var userCount = 0;
//             allUsers.forEach(snap => {
//                 let user = snap.val();
//                 if (snap.exists() && user) {
//                     console.log(user);
//                     if (isDiscoverableTo(currentUser, user, seenUIDS, pref)) {
//                         console.log("User is discoverable:", user);
//                         visibleUsers.push(user);
//                     }
//                     userCount++;
//                     if (userCount == allUsers.length) {
//                         let keys = Object.keys(visibleUsers);
//                         let val = {}
//                         for (var i=0;i<keys.length;i++) {
//                             val[keys[i]] = new Date().getTime();
//                         }
//                         resolve(res.json(visibleUsers));
//                     }
//                 } else {
//                     userCount++;
//                     if (userCount == allUsers.length) {
//                         let keys = Object.keys(visibleUsers);
//                         let val = {}
//                         for (var i=0;i<keys.length;i++) {
//                             val[keys[i]] = new Date().getTime();
//                         }
//                         resolve(res.json(visibleUsers));
//                     }
//                 }
//             });
//         })
//         .catch(error => {
//             console.log(error);
//             reject(error);
//         });
//     });
// });

// function isDiscoverableTo(user1, user2, seenUIDs, pref1) {
//     if (!user2.id) {
//         console.log("Undefined error");
//         return false;
//     } else if (user1.id == user2.id) {
//         console.log("Same id error");
//         return false;
//     } else if (seenUIDs && user2.id in seenUIDs) {
//         console.log("Already saw error");
//         return false;
//     /*if (user1.gender == 'male' && !pref2.lfm)
//         return false;
//     if (user1.gender == 'female' && !pref2.lff)
//         return false;*/
//     } else if (user2.gender == 'male' && !pref1.lfm) {
//         console.log("Wrong gender error");
//         return false;
//     } else if (user2.gender == 'female' && !pref1.lff) {
//         console.log("Wrong gender error");
//         return false;
//     } else if (pref1.distance == 'national' && user1.country != user2.country) {
//         console.log("Different country error");
//         return false;
//     }
//     return true;
//   }

// // Keeps track of the 'user_liked' child list tally in a separate node.
// exports.trackLikeCount = functions.database.ref('/user_liked/{uid}/{otherid}').onWrite(event => {
//   const uid = event.data.ref.key;
//   console.log("User with id: " + uid + "recieved a like. Updating rank...");
//   // Return the promise from rankRef.transaction() so our function
//   // waits for this async event to complete before it exits.
//   const rankRef = admin.database().ref('/user_rank/' + uid);
//   return rankRef.transaction(current => {
//     if (event.data.exists() && !event.data.previous.exists()) {
//       return (current || 0) + 1;
//     }
//     else if (!event.data.exists() && event.data.previous.exists()) {
//       return (current || 0) - 1;
//     }
//   }).then(() => {
//     console.log('Rank updated.');
//   });
// });

// // Keeps track of the 'user_liked' child list tally in a separate node.
// exports.trackDoubleLikeCount = functions.database.ref('/user_double_liked/{uid}/{otherid}').onWrite(event => {
//   const uid = event.data.ref.key;
//   console.log("User with id: " + uid + "recieved a double like. Updating rank...");
//   // Return the promise from rankRef.transaction() so our function
//   // waits for this async event to complete before it exits.
//   const rankRef = admin.database().ref('/user_rank/' + uid);
//   return rankRef.transaction(current => {
//     if (event.data.exists() && !event.data.previous.exists()) {
//       return (current || 0) + 2;
//     }
//     else if (!event.data.exists() && event.data.previous.exists()) {
//       return (current || 0) - 2;
//     }
//   }).then(() => {
//     console.log('Rank updated.');
//   });
// });

exports.sanitizeRankings = functions.https.onRequest((req, res) => {
    // Grab the secret parameter.
  const secret = req.query.secret;
  if (secret == 'Dating2017') {
    console.log("Sanitizing rank data...");
    return new Promise((resolve, reject) => {
        let likeRef = admin.database().ref('/user_liked/');
        likeRef.once('value')
        .then(likeSnaps => {
            if (likeSnaps.exists()) {
                console.log("Fetch returned likes...");
                let doubleLikeRef = admin.database().ref('/user_double_liked/');
                doubleLikeRef.once('value')
                .then(doubleLikeSnaps => {
                    if (doubleLikeSnaps.exists()) {
                        console.log("Fetch returned double likes...");
                        let likedCounts = {};
                        likeSnaps.forEach(snapshot => {
                            if (snapshot.exists()) {
                                snapshot.forEach(liked => {
                                        if (liked.key) {
                                            if (!(liked.key in likedCounts)) {
                                                likedCounts[liked.key] = 0;
                                            }
                                            // console.log("adding 1 for " + liked.key);
                                            likedCounts[liked.key] += 1;
                                        }
                                    });
                                }
                            })

                        doubleLikeSnaps.forEach(snapshot => {
                            if (snapshot.exists()) {
                                snapshot.forEach(liked => {
                                    if (liked.key) {
                                        if (!(liked.key in likedCounts)) {
                                            likedCounts[liked.key] = 0;
                                        }
                                        // console.log("adding 2 for " + liked.key);
                                        likedCounts[liked.key] += 2;
                                    }
                                });
                            }
                        })
                        const rankRef = admin.database().ref('/user_rank/');
                        resolve(rankRef.set(likedCounts));
                    } else {
                        reject(null);
                    }
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
            } else {
                reject(null);
            }
        })
        .catch(error => {
            console.log(error);
            reject(error);
        });
    });
  } else {
      console.log("Invalid secret. Please try again.");
  }
});