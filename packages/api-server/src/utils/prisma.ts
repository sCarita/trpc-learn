import { PrismaClient } from '@prisma/client';
import customConfig from '../config/default';

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (customConfig.env !== 'production') {
    global.prisma = prisma;
}

async function connectDB() {
    try {
        await prisma.$connect();
        console.log('🚀 Database connected successfully');
    } catch (error) {
        console.log(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

export default connectDB;