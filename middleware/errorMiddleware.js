// middleware/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Standardized Logging Format
    console.error(`[${new Date().toISOString()}] ERROR: ${err.message} | Path: ${req.originalUrl}`);

    res.status(statusCode).json({
        success: false,
        error: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export const notFound = (req, res, next) => {
    // Redirect API calls to JSON error, otherwise send 404 HTML
    if (req.originalUrl.startsWith('/api')) {
        res.status(404);
        next(new Error(`Not Found - ${req.originalUrl}`));
    } else {
        res.status(404).sendFile('404.html', { root: 'public' });
    }
};