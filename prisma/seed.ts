import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clear existing data
    await prisma.activity.deleteMany()
    await prisma.deal.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.company.deleteMany()

    // Create Companies
    const companies = await Promise.all([
        prisma.company.create({
            data: {
                name: 'TechVision Inc.',
                industry: 'Technology',
                website: 'https://techvision.com',
                phone: '+1 (555) 123-4567',
                address: '123 Innovation Drive, San Francisco, CA 94102',
                logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=techvision',
            },
        }),
        prisma.company.create({
            data: {
                name: 'Global Finance Corp',
                industry: 'Finance',
                website: 'https://globalfinance.com',
                phone: '+1 (555) 234-5678',
                address: '456 Wall Street, New York, NY 10005',
                logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=globalfinance',
            },
        }),
        prisma.company.create({
            data: {
                name: 'HealthCare Plus',
                industry: 'Healthcare',
                website: 'https://healthcareplus.com',
                phone: '+1 (555) 345-6789',
                address: '789 Medical Center Blvd, Boston, MA 02115',
                logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=healthcare',
            },
        }),
        prisma.company.create({
            data: {
                name: 'RetailMax',
                industry: 'Retail',
                website: 'https://retailmax.com',
                phone: '+1 (555) 456-7890',
                address: '321 Commerce Ave, Chicago, IL 60601',
                logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=retailmax',
            },
        }),
        prisma.company.create({
            data: {
                name: 'Industrial Solutions',
                industry: 'Manufacturing',
                website: 'https://industrialsolutions.com',
                phone: '+1 (555) 567-8901',
                address: '555 Factory Lane, Detroit, MI 48201',
                logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=industrial',
            },
        }),
    ])

    console.log(`✅ Created ${companies.length} companies`)

    // Create Contacts
    const contacts = await Promise.all([
        // TechVision contacts
        prisma.contact.create({
            data: {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@techvision.com',
                phone: '+1 (555) 111-2222',
                position: 'CEO',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                status: 'active',
                companyId: companies[0].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Michael',
                lastName: 'Chen',
                email: 'michael.chen@techvision.com',
                phone: '+1 (555) 111-3333',
                position: 'CTO',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
                status: 'active',
                companyId: companies[0].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Emily',
                lastName: 'Davis',
                email: 'emily.davis@techvision.com',
                phone: '+1 (555) 111-4444',
                position: 'VP of Sales',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
                status: 'active',
                companyId: companies[0].id,
            },
        }),
        // Global Finance contacts
        prisma.contact.create({
            data: {
                firstName: 'James',
                lastName: 'Wilson',
                email: 'james.wilson@globalfinance.com',
                phone: '+1 (555) 222-3333',
                position: 'Managing Director',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
                status: 'active',
                companyId: companies[1].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Amanda',
                lastName: 'Brown',
                email: 'amanda.brown@globalfinance.com',
                phone: '+1 (555) 222-4444',
                position: 'Investment Analyst',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda',
                status: 'active',
                companyId: companies[1].id,
            },
        }),
        // HealthCare Plus contacts
        prisma.contact.create({
            data: {
                firstName: 'Dr. Robert',
                lastName: 'Martinez',
                email: 'robert.martinez@healthcareplus.com',
                phone: '+1 (555) 333-4444',
                position: 'Chief Medical Officer',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
                status: 'active',
                companyId: companies[2].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Jennifer',
                lastName: 'Lee',
                email: 'jennifer.lee@healthcareplus.com',
                phone: '+1 (555) 333-5555',
                position: 'Operations Manager',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
                status: 'active',
                companyId: companies[2].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'David',
                lastName: 'Taylor',
                email: 'david.taylor@healthcareplus.com',
                phone: '+1 (555) 333-6666',
                position: 'Procurement Director',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
                status: 'active',
                companyId: companies[2].id,
            },
        }),
        // RetailMax contacts
        prisma.contact.create({
            data: {
                firstName: 'Lisa',
                lastName: 'Anderson',
                email: 'lisa.anderson@retailmax.com',
                phone: '+1 (555) 444-5555',
                position: 'Head of Purchasing',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
                status: 'active',
                companyId: companies[3].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Christopher',
                lastName: 'White',
                email: 'chris.white@retailmax.com',
                phone: '+1 (555) 444-6666',
                position: 'Store Operations Manager',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
                status: 'active',
                companyId: companies[3].id,
            },
        }),
        // Industrial Solutions contacts
        prisma.contact.create({
            data: {
                firstName: 'Patricia',
                lastName: 'Garcia',
                email: 'patricia.garcia@industrialsolutions.com',
                phone: '+1 (555) 555-6666',
                position: 'Plant Manager',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia',
                status: 'active',
                companyId: companies[4].id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Thomas',
                lastName: 'Robinson',
                email: 'thomas.robinson@industrialsolutions.com',
                phone: '+1 (555) 555-7777',
                position: 'Supply Chain Director',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thomas',
                status: 'active',
                companyId: companies[4].id,
            },
        }),
        // Independent contacts
        prisma.contact.create({
            data: {
                firstName: 'Jessica',
                lastName: 'Moore',
                email: 'jessica.moore@freelance.com',
                phone: '+1 (555) 666-7777',
                position: 'Consultant',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica',
                status: 'active',
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Daniel',
                lastName: 'Jackson',
                email: 'daniel.jackson@startup.io',
                phone: '+1 (555) 777-8888',
                position: 'Founder',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel',
                status: 'lead',
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Rachel',
                lastName: 'Thompson',
                email: 'rachel.thompson@enterprise.net',
                phone: '+1 (555) 888-9999',
                position: 'Business Development',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rachel',
                status: 'inactive',
            },
        }),
    ])

    console.log(`✅ Created ${contacts.length} contacts`)

    // Create Deals
    const deals = await Promise.all([
        prisma.deal.create({
            data: {
                title: 'Enterprise Software License',
                value: 250000,
                stage: 'negotiation',
                priority: 'high',
                probability: 75,
                expectedClose: new Date('2025-01-15'),
                description: 'Annual enterprise license for our flagship product',
                contactId: contacts[0].id,
                companyId: companies[0].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Cloud Migration Project',
                value: 180000,
                stage: 'proposal',
                priority: 'high',
                probability: 60,
                expectedClose: new Date('2025-02-01'),
                description: 'Full cloud migration and setup services',
                contactId: contacts[1].id,
                companyId: companies[0].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Financial Analytics Platform',
                value: 450000,
                stage: 'qualified',
                priority: 'high',
                probability: 40,
                expectedClose: new Date('2025-03-15'),
                description: 'Custom analytics dashboard for trading operations',
                contactId: contacts[3].id,
                companyId: companies[1].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Compliance Software',
                value: 85000,
                stage: 'closed-won',
                priority: 'medium',
                probability: 100,
                expectedClose: new Date('2024-12-01'),
                description: 'Regulatory compliance tracking system',
                contactId: contacts[4].id,
                companyId: companies[1].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Patient Management System',
                value: 320000,
                stage: 'proposal',
                priority: 'high',
                probability: 55,
                expectedClose: new Date('2025-02-28'),
                description: 'Integrated patient records and scheduling system',
                contactId: contacts[5].id,
                companyId: companies[2].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Medical Equipment Integration',
                value: 95000,
                stage: 'lead',
                priority: 'medium',
                probability: 20,
                expectedClose: new Date('2025-04-15'),
                description: 'IoT integration for medical devices',
                contactId: contacts[7].id,
                companyId: companies[2].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'POS System Upgrade',
                value: 125000,
                stage: 'negotiation',
                priority: 'medium',
                probability: 80,
                expectedClose: new Date('2025-01-10'),
                description: 'Point of sale system across all retail locations',
                contactId: contacts[8].id,
                companyId: companies[3].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Inventory Management',
                value: 75000,
                stage: 'qualified',
                priority: 'low',
                probability: 35,
                expectedClose: new Date('2025-03-01'),
                description: 'Real-time inventory tracking solution',
                contactId: contacts[9].id,
                companyId: companies[3].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Factory Automation Suite',
                value: 520000,
                stage: 'proposal',
                priority: 'high',
                probability: 50,
                expectedClose: new Date('2025-04-01'),
                description: 'Complete factory floor automation system',
                contactId: contacts[10].id,
                companyId: companies[4].id,
            },
        }),
        prisma.deal.create({
            data: {
                title: 'Supply Chain Optimization',
                value: 145000,
                stage: 'closed-lost',
                priority: 'medium',
                probability: 0,
                expectedClose: new Date('2024-11-15'),
                description: 'Supply chain analytics and optimization',
                contactId: contacts[11].id,
                companyId: companies[4].id,
            },
        }),
    ])

    console.log(`✅ Created ${deals.length} deals`)

    // Create Activities
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const activities = await Promise.all([
        prisma.activity.create({
            data: {
                type: 'call',
                title: 'Follow-up call with Sarah',
                description: 'Discuss contract terms and next steps',
                completed: false,
                dueDate: tomorrow,
                contactId: contacts[0].id,
                dealId: deals[0].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'meeting',
                title: 'Product demo for TechVision',
                description: 'Demo new features to the CTO',
                completed: false,
                dueDate: nextWeek,
                contactId: contacts[1].id,
                dealId: deals[1].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'email',
                title: 'Send proposal to Global Finance',
                description: 'Finalize and send the analytics platform proposal',
                completed: false,
                dueDate: today,
                contactId: contacts[3].id,
                dealId: deals[2].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'task',
                title: 'Prepare contract documents',
                description: 'Draft the final contract for POS upgrade',
                completed: false,
                dueDate: tomorrow,
                contactId: contacts[8].id,
                dealId: deals[6].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'call',
                title: 'Initial discovery call',
                description: 'Learn about their requirements for automation',
                completed: false,
                dueDate: nextWeek,
                contactId: contacts[10].id,
                dealId: deals[8].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'meeting',
                title: 'Quarterly review meeting',
                description: 'Review Q4 progress and plan for next quarter',
                completed: true,
                dueDate: yesterday,
                contactId: contacts[0].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'email',
                title: 'Thank you email',
                description: 'Send thank you note after successful deal closure',
                completed: true,
                dueDate: lastWeek,
                contactId: contacts[4].id,
                dealId: deals[3].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'task',
                title: 'Update CRM records',
                description: 'Ensure all contact information is current',
                completed: true,
                dueDate: lastWeek,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'call',
                title: 'Check-in with Dr. Martinez',
                description: 'Regular check-in on project status',
                completed: false,
                dueDate: tomorrow,
                contactId: contacts[5].id,
                dealId: deals[4].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'meeting',
                title: 'Team sync on HealthCare Plus deal',
                description: 'Internal meeting to align on deal strategy',
                completed: false,
                dueDate: today,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'email',
                title: 'Send pricing update',
                description: 'Share revised pricing for inventory management',
                completed: false,
                dueDate: nextWeek,
                contactId: contacts[9].id,
                dealId: deals[7].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'task',
                title: 'Research competitor offerings',
                description: 'Analyze competing solutions for factory automation',
                completed: true,
                dueDate: lastWeek,
                dealId: deals[8].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'call',
                title: 'Reconnect with Jennifer Lee',
                description: 'Touch base after conference meeting',
                completed: false,
                dueDate: nextWeek,
                contactId: contacts[6].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'meeting',
                title: 'Contract negotiation session',
                description: 'Final negotiation meeting for enterprise license',
                completed: false,
                dueDate: tomorrow,
                contactId: contacts[0].id,
                dealId: deals[0].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'email',
                title: 'Weekly update to Lisa',
                description: 'Send weekly project status update',
                completed: true,
                dueDate: yesterday,
                contactId: contacts[8].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'task',
                title: 'Prepare presentation deck',
                description: 'Create slides for upcoming board presentation',
                completed: false,
                dueDate: nextWeek,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'call',
                title: 'Upsell discussion with Amanda',
                description: 'Explore additional service opportunities',
                completed: false,
                dueDate: today,
                contactId: contacts[4].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'meeting',
                title: 'Technical review session',
                description: 'Deep dive into technical requirements',
                completed: true,
                dueDate: lastWeek,
                contactId: contacts[11].id,
                dealId: deals[9].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'email',
                title: 'Introduction email to Daniel',
                description: 'Initial outreach to potential new client',
                completed: false,
                dueDate: today,
                contactId: contacts[13].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'task',
                title: 'Review Q1 pipeline forecast',
                description: 'Analyze and update sales forecast for next quarter',
                completed: false,
                dueDate: nextWeek,
            },
        }),
    ])

    console.log(`✅ Created ${activities.length} activities`)

    console.log('🎉 Database seeded successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
