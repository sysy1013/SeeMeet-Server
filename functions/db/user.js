const _ = require('lodash');
const convertSnakeToCamel = require("../lib/convertSnakeToCamel");

const deleteUser = async (client,userId)=>{
    const {rows} = await client.query(
        `UPDATE "user" u
        SET is_deleted = TRUE, updated_at = now()
        WHERE id = $1
        RETURNING *
        `,
        [userId],
    )
    return convertSnakeToCamel.keysToCamel(rows[0]);
}
module.exports = {deleteUser};