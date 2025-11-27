import { prisma } from '../src/lib/prisma';
import { v4 as uuidv4 } from 'uuid';


async function main() {
    console.log('Seeding database...');

    const user1 = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            name: 'Alice Johnson',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            name: 'Bob Smith',
        },
    });

    const user3 = await prisma.user.create({
        data: {
            email: 'carol@example.com',
            name: 'Carol Davis',
            
        },
    });
    console.log('Created users:', { user1, user2, user3 });


    const concertEvent = await prisma.event.create({
        data: {
            id: uuidv4(), // Generate a unique ID for the event
            name: 'Summer Music Festival 2024',
            totalTickets: 1000,
            availableTickets: 1000,
            createdAt: new Date(), // Set createdAt to the current date
            updatedAt: new Date(), // Ensure updatedAt is set
        },
    });

    const conferenceEvent = await prisma.event.create({
        data: {
            id: uuidv4(), // Generate a unique ID for the event
            name: 'Tech Conference 2024',
            totalTickets: 500,
            availableTickets: 500,
            createdAt: new Date(), // Set createdAt to the current date
            updatedAt: new Date(), // Ensure updatedAt is set
        },
    });

    console.log('Created events:', { concertEvent, conferenceEvent });
    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
