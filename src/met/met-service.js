const fetch = require('isomorphic-fetch')
const schedule = require('node-schedule')


let dailyInterval = () => schedule.scheduleJob({ hour: 00, minute: 12, second: 00 }, function(){
    console.log('Time for tea!')
    return fetch(`${process.env.API_ENDPOINT}`)
        .then(res => res.json())
        .then(resJson => console.log(resJson))
        .then(resJson => resJson)
        .catch(err => {
            console.log('dailyIntervalTest() Error:', err.message)
            // return err
        })
})
dailyInterval();


const MetService = {
    getObjectIds(knex) {
        console.log('working')
        return knex
            .select('object_id')
            .from('museum_art_data')
            .returning('*')
    },
    insertObjectData(knex, newData) {
        console.log('insertObjectData(newData)', newData)
        return knex
            // .raw()
            .insert(newData)
            .into('museum_art_data')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    insertInterval(knex, newData) {
        console.log('insertInterval(newData)', newData)
        return knex
            .insert(newData)
            .into('daily_interval')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getInterval(knex) {
        console.log('getInterval working')
        return knex
            .select('*')
            .from('daily_interval')
            .orderBy('id')
            .first()
            
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
            .where('object_id', id)
            // .first()
    },
    getRandomId(objectArray) {
        let randomId = objectArray[Math.floor(Math.random() * objectArray.length)];
        console.log('randomId', randomId.object_id);
        return parseInt(randomId.object_id);
        // let objId = randomId.object_id
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