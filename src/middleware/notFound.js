/**
 * Sends a Danish response when no route matches the request.
 * @param {import('express').Request} req The Express request.
 * @param {import('express').Response} res The Express response.
 */
function notFound(req, res) {
    res.status(404).json({ error: 'Ruten blev ikke fundet.' });
}

module.exports = { notFound };
