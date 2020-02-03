// const fetch = require('isomorphic-fetch')

// const metRouter = require('./met-router')

// const MetService = {
//     insertObjectData(knex, newData) {
//         console.log('insertObjectData(newData)', newData)
//         // if newData.object_id exists in db, return
//         // else { 
//         return knex
//             .insert(newData)
//             .into('museum_art_data')
//             .returning('*')
//             .then(rows => {
//                 return rows[0]
//             })
//     },
//     getObjectData(knex, objectArray) {
//         for (let i = 0; i < 5; i++) {
//             // <==================================   TODO   ==================================> 
//             // if newData.object_id exists in db, return
//             // if (ON C)
//             // else { 
//             fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectArray[i]}`)
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('something went wrong')
//                     }
//                     // console.log('response ran')
//                     return response.json();
//                 })
//                 // .then(response => response.json())
//                 .then(resJson => {
//                     console.log('test')
//                     const newData = {
//                         object_id: resJson.objectID,
//                         primary_image: resJson.primaryImage,
//                         art_title: resJson.title,
//                         art_artist: resJson.artistDisplayName,
//                         art_date: resJson.objectDate
//                     }
//                     // console.log('newData running')
//                     MetService.insertObjectData(knex, newData)
//                     console.log('insertObjectData ran')
//                 })
//                 // .catch(next)
//                 .catch(err => {
//                     // console.log('Error received', err.message)
//                     return err
//                 })
//         }
//     },
//     getRandomId(objectArray) {
//         let randomId = objectArray[Math.floor(Math.random() * objectArray.length)];
//         console.log('randomId', randomId);
//         return randomId;
//     },
//     getMetData(knex) {
//         fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=european&medium=Paintings')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(response.statusText)
//                 }
//                 return response.json()
//             })
//             .then(resJson => {
//                 // console.log('resJson', resJson)
//                 const objectIds = resJson.objectIDs;
//                 // console.log('objectIds', objectIds)
//                 MetService.getObjectData(knex, objectIds)

//                 // <==================================   TODO   ==================================> 
//                 // map objectIDs and filter out paintings, hasImage, etc.
//                 // then insert into db with necessary data
//                 // move randomId below out to another function and call once initial data is set

//                 let randomId = MetService.getRandomId(objectIds);
//                 console.log('getRandomId ran', randomId)
//             })
//             .catch(err => {
//                 console.log('getMetData() Error:', err.message)
//                 // return err
//             })
//     }

// }

// module.exports = MetService 

const fetch = require('isomorphic-fetch')

const metRouter = require('./met-router')

const MetService = {
    // checkExists(knex, newData) {
    //     return knex
    //         .select('*')
    //         .where('object_id', newData.object_id)
    //         .from('museum_art_data')
    //         // .update('*')
    // },
    insertObjectData(knex, newData) {
        // for (let i = 0; i < 5; i++) {
        //     if (newData.object_id exists in db,)
        // }
        console.log('insertObjectData(newData)', newData)
        // else { 
            // if (newData.object_id )
        return knex
            // .raw()
            .insert(newData)
            .into('museum_art_data')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getObjectData(knex, objectArray) {
        for (let i = 0; i < 5; i++) {
            // <==================================   TODO   ==================================> 
            // if newData.object_id exists in db, return
            // if (ON C)
            // else { 

            fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectArray[i]}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('something went wrong')
                    }
                    // console.log('response ran')
                    return response.json();
                })
                // .then(response => response.json())
                .then(resJson => {
                    console.log('test')
                    const newData = {
                        object_id: resJson.objectID,
                        primary_image: resJson.primaryImage,
                        art_title: resJson.title,
                        art_artist: resJson.artistDisplayName,
                        art_date: resJson.objectDate
                    }
                    console.log('newData running', knex)
                    MetService.insertObjectData(knex, newData)
                    console.log('insertObjectData ran')
                })
                // .catch(next)
                .catch(err => {
                    console.log('Error received', err.message)
                    // return err
                })
        }
    },
    getById(knex, id) {
        return knex
            .from('museum_art_data')
            .select('*')
            .where('id', id)
            .first()
    },
    getRandomId(objectArray) {
        let randomId = objectArray[Math.floor(Math.random() * objectArray.length)];
        console.log('randomId', randomId);
        return randomId;
    },
    getMetData(knex) {
        return fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=european&medium=Paintings')
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                // console.log(response)
                return response.json()
            })
            .then(resJson => {
                // console.log('resJson', resJson)
                const objectIds = resJson.objectIDs;
                console.log('KNEX====>', knex)
                MetService.getObjectData(knex, objectIds)

                // <==================================   TODO   ==================================> 
                // map objectIDs and filter out paintings, hasImage, etc.
                // then insert into db with necessary data
                // move randomId below out to another function and call once initial data is set

                let randomId = MetService.getRandomId(objectIds);
                console.log('getRandomId ran', randomId)
            })
            .catch(err => {
                console.log('getMetData() Error:', err.message)
                // return err
            })
    },
    deleteMetItem(knex, object_id) {
        return knex('museum_art_data')
            .where({ object_id })
            .delete()
    },

}

module.exports = MetService