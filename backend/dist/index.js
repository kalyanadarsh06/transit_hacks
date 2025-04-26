"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Routes
const transit_1 = __importDefault(require("./routes/transit"));
const safety_1 = __importDefault(require("./routes/safety"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to SafeTransit API',
        endpoints: {
            transit: '/api/transit',
            safety: '/api/safety',
            health: '/api/health'
        }
    });
});
// Routes
app.use('/api/transit', transit_1.default);
app.use('/api/safety', safety_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SafeTransit API is running' });
});
// Start server
app.listen(port, () => {
    console.log(`⚡️ Server is running at http://localhost:${port}`);
    console.log('SafeTransit API is ready to serve requests');
});
exports.default = app;
//# sourceMappingURL=index.js.map