/**
 * Converts errors into a fixed Danish JSON response.
 * @param {{ type?: string } | null | undefined} err The error from Express or middleware.
 * @param {import('express').Request} req The Express request.
 * @param {import('express').Response} res The Express response.
 * @param {import('express').NextFunction} next The next middleware function.
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
