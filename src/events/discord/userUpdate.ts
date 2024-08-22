import { Events, User } from "discord.js";
import { EventType } from "../../enums/enums";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";

export = {
    name: Events.UserUpdate,
    type: EventType.Classic,
    once: false,
    execute: async (main: Bot, db: Database, user1: User, user2: User) => {
        if(user1.username !== user2.username) {
            let user_db = await db.models.UserDB.findOne({id: user1.id});
            if(!user_db) await db.models.UserDB.create({id: user1.id, prevnames: [{date: Date.now(), content: user1.username}, {date: Date.now(), content: user2.username}], blacklist: {isBlacklisted: false}, whitelist: {isWhitelisted: false}}).catch(e => {})
            else {
                user_db.prevnames!.push({
                    date: Date.now(),
                    content: user2.username
                }); 
                user_db.save();
            }
        }
    }
}
