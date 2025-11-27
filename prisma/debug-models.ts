import { prisma } from '../src/lib/prisma';

async function debug() {
    console.log('=== Debugging Prisma Models ===');
    
    // Check all available models
    console.log('Available models:', Object.keys(prisma).filter(key => 
        !key.startsWith('_') && !key.startsWith('$')
    ));
    
    // Check specific models
    console.log('prisma.user:', typeof prisma.user);
    console.log('prisma.booking:', typeof prisma.booking);
    console.log('prisma.event:', typeof prisma.event);
    console.log('prisma.waitinglist:', typeof prisma.waitingList);
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Test each model
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ User model works. Count: ${userCount}`);
    } catch (e: any) {
        console.log('❌ User model error:', e.message);
    }
    
    try {
        const eventCount = await prisma.event.count();
        console.log(`✅ Event model works. Count: ${eventCount}`);
    } catch (e: any) {
        console.log('❌ Event model error:', e.message);
    }
    
    await prisma.$disconnect();
}

debug().catch(console.error);