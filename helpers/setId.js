export const updateIdAndRetrieveData = async (obj, connection) => {

    try {
        const { table, insertId, idStart, field } = obj;

        // Calculate the new id
        const newId = `${idStart}${1000 + insertId}`;
        console.log(newId)

        // Update the id for the specified row within the transaction
        await connection.execute(
            `UPDATE ${table} SET ${field} = ? WHERE uid = ?`,
            [newId, insertId]
        );

        // Retrieve the updated row within the transaction
        const [rows] = await connection.execute(
            `SELECT * FROM ${table} WHERE uid = ?`,
            [insertId]
        );

        // Commit the transaction since everything was successful

        delete rows[0].password
        return rows[0]; // Return the updated row
    } catch (error) {
        // If an error occurs, roll back the transaction

        throw error; // Re-throw the error to handle it at a higher level
    }
};

/*// Usage example for agent
const dataObj = {
    table: 'agent',
    insertId: 4,
    idStart: 'QTA',
};

// Pass the connection as a parameter
const updatedAgent = await updateIdAndRetrieveDataWithTransaction(dataObj, connection);
console.log(updatedAgent); // This will print the updated row.*/
