const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getALLFriendById = async(client,userId)=>{
    const {rows} = await client.query(
        `
        SELECT * FROM "friend"
        WHERE id = $1
        `,
        [userId]
    )
    return convertSnakeToCamel.keysToCamel(rows);
}

const searchUser = async(client,email)=>{
    const {rows} = await client.query(
        `
        SELECT * FROM "user" u
        WHERE email = $1
        `,
        [email]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

const requestAddFriend = async(client,userId,receiver)=>{
    const { rows } = await client.query(
        `
        INSERT INTO "friend"
        (sender,receiver)
        VALUES
        ($1, $2)
        RETURNING *
        `,
        [userId,receiver],
    )
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const findreceiver = async(client, email)=>{
    const {rows} = await client.query(
        `
        SELECT id FROM "user" u
        WHERE email = $1
        `,
        [email]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const acceptFriend = async(client,userId,rId)=>{
    const {rows} = await client.query(
        `
        UPDATE "friend"
        SET is_confirm = TRUE, updated_at = now()
        WHERE receiver = $1 AND sender = $2
        RETURNING *
        `,
        [userId,rId],
    )
    return convertSnakeToCamel.keysToCamel(rows[0])
}

module.exports = {getALLFriendById,searchUser,requestAddFriend,findreceiver,acceptFriend}