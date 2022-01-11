const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getALLFriendById = async(client,userId)=>{
    const {rows} = await client.query(
        `
        SELECT * FROM "friend"
        WHERE id = $1
        AND is_deleted = FALSE
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
module.exports = {getALLFriendById,searchUser}