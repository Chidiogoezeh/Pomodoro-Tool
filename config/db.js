import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // No need for extra options like useNewUrlParser in Mongoose 6+
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`[${new Date().toISOString()}] INFO: MongoDB Connected: ${conn.connection.host}`);
        console.log(`[${new Date().toISOString()}] INFO: Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;