const fetch = require('isomorphic-fetch')
const schedule = require('node-schedule')


let dailyInterval = () => schedule.scheduleJob({ hour: 00, minute: 00, second: 00 }, function(){
    return fetch(`${process.env.API_ENDPOINT}`)
        .then(res => res.json())
        .then(resJson => resJson)
        .catch(err => {
            return err
        })
})
dailyInterval();


const MetService = {
    getObjectIds(knex) {
        return knex
            .select('object_id')
            .from('museum_art_data')
            .returning('*')
    },
    insertObjectData(knex, newData) {
        return knex
            .insert(newData)
            .into('museum_art_data')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    insertInterval(knex, newData) {
        return knex
            .insert(newData)
            .into('daily_interval')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getInterval(knex) {
        return knex
            .select('*')
            .from('daily_interval')
            .orderBy('daily_interval_id', 'desc')
            .first()
    },
    getObjectData(knex, objectArray) {
        for (let i = 0; i < 5; i++) {
            fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectArray[i]}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('something went wrong')
                    }
                    return response.json();
                })
                .then(resJson => {
                    const newData = {
                        object_id: resJson.objectID,
                        primary_image: resJson.primaryImage,
                        art_title: resJson.title,
                        art_artist: resJson.artistDisplayName,
                        art_date: resJson.objectDate
                    }
                    MetService.insertObjectData(knex, newData)
                })
                .catch(err => {
                    return err
                })
        }
    },
    getById(knex, id) {
        return knex
            .from('museum_art_data')
            .select('*')
            .where('object_id', id)
    },
    getRandomId(objectArray) {
        let randomId = objectArray[Math.floor(Math.random() * objectArray.length)];
        return parseInt(randomId.object_id);
    },
    getMetData(knex) {
        return fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=european&medium=Paintings')
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json()
            })
            .then(resJson => {
                const objectIds = resJson.objectIDs;
                MetService.getObjectData(knex, objectIds)
                let randomId = MetService.getRandomId(objectIds);
            })
            .catch(err => {
                return err
            })
    },
    deleteMetItem(knex, object_id) {
        return knex('museum_art_data')
            .where({ object_id })
            .delete()
    },
}

module.exports = MetService