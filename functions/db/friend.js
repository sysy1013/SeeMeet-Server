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
    return convertSnakeToCamel.keysToCamel(rows)
}

module.exports = {getALLFriendById}