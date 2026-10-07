/**
 * Sender et dansk svar, når ingen rute matcher anmodningen.
 * @param {import('express').Request} req Express-anmodningen.
 * @param {import('express').Response} res Express-svaret.
 */
function notFound(req, res) {
    res.status(404).json({ error: 'Ruten blev ikke fundet.' });
}

module.exports = { notFound };
