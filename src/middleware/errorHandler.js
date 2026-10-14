/**
 * Omdanner fejl til et sikkert, dansk JSON-svar.
 * @param {{ type?: string } | null | undefined} err Fejlen fra Express eller middleware.
 * @param {import('express').Request} req Express-anmodningen.
 * @param {import('express').Response} res Express-svaret.
 */
function errorHandler(err, req, res, next) {
    const isInvalidJson = err?.type === 'entity.parse.failed';
    const statusCode = isInvalidJson ? 400 : 500;
    const message = isInvalidJson
        ? 'Anmodningen indeholder ugyldig JSON.'
        : 'Der opstod en intern serverfejl.';

    res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
