import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Create ADMIN user
    const adminPassword = await bcrypt.hash("admin#123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@getjob.com" },
        update: {},
        create: {
            email: "admin@getjob.com",
            fullName: "Admin GetJob",
            password: adminPassword,
            role: "ADMIN",
            verified: true,
        },
    });
    console.log("✅ Admin user created:", admin.email);

    // 2. Create 10 Job postings
    const jobs = [
        {
            jobName: "Frontend Developer",
            jobType: "Full-time",
            jobDescription:
                "Kami mencari Frontend Developer yang berpengalaman dengan React.js dan Next.js untuk membangun aplikasi web modern. Kandidat ideal memiliki pemahaman mendalam tentang UI/UX dan dapat bekerja dalam tim agile.",
            numberOfCandidateNeeded: 2,
            minimumSalary: "8000000",
            maximumSalary: "15000000",
            minimumProfileInformationRequired: {
                experience: "2 tahun",
                skills: ["React.js", "Next.js", "TypeScript", "Tailwind CSS"],
                education: "S1 Teknik Informatika atau setara",
            },
        },
        {
            jobName: "Backend Developer",
            jobType: "Full-time",
            jobDescription:
                "Bergabunglah dengan tim backend kami untuk membangun API yang scalable dan reliable. Kami menggunakan Node.js, Express, dan PostgreSQL. Pengalaman dengan microservices adalah nilai plus.",
            numberOfCandidateNeeded: 3,
            minimumSalary: "9000000",
            maximumSalary: "16000000",
            minimumProfileInformationRequired: {
                experience: "2-3 tahun",
                skills: ["Node.js", "Express", "PostgreSQL", "REST API", "Docker"],
                education: "S1 Teknik Informatika atau setara",
            },
        },
        {
            jobName: "UI/UX Designer",
            jobType: "Full-time",
            jobDescription:
                "Kami mencari UI/UX Designer yang kreatif dan detail-oriented untuk merancang pengalaman pengguna yang luar biasa. Kandidat harus mahir menggunakan Figma dan memiliki portfolio yang kuat.",
            numberOfCandidateNeeded: 1,
            minimumSalary: "7000000",
            maximumSalary: "12000000",
            minimumProfileInformationRequired: {
                experience: "1-2 tahun",
                skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
                education: "S1 Desain Komunikasi Visual atau setara",
            },
        },
        {
            jobName: "DevOps Engineer",
            jobType: "Full-time",
            jobDescription:
                "Posisi DevOps Engineer untuk mengelola infrastructure dan CI/CD pipeline. Pengalaman dengan AWS, Docker, Kubernetes, dan automation tools sangat diutamakan.",
            numberOfCandidateNeeded: 1,
            minimumSalary: "12000000",
            maximumSalary: "20000000",
            minimumProfileInformationRequired: {
                experience: "3-5 tahun",
                skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
                education: "S1 Teknik Informatika atau setara",
            },
        },
        {
            jobName: "Mobile Developer",
            jobType: "Full-time",
            jobDescription:
                "Kami membutuhkan Mobile Developer untuk mengembangkan aplikasi iOS dan Android menggunakan React Native. Kandidat harus memiliki pengalaman publishing aplikasi ke App Store dan Play Store.",
            numberOfCandidateNeeded: 2,
            minimumSalary: "8500000",
            maximumSalary: "14000000",
            minimumProfileInformationRequired: {
                experience: "2 tahun",
                skills: ["React Native", "iOS", "Android", "Redux", "Firebase"],
                education: "S1 Teknik Informatika atau setara",
            },
        },
        {
            jobName: "Data Analyst",
            jobType: "Full-time",
            jobDescription:
                "Bergabunglah dengan tim data kami untuk menganalisis data bisnis dan memberikan insights yang actionable. Pengalaman dengan SQL, Python, dan tools visualisasi data seperti Tableau atau Power BI diperlukan.",
            numberOfCandidateNeeded: 2,
            minimumSalary: "7500000",
            maximumSalary: "13000000",
            minimumProfileInformationRequired: {
                experience: "1-2 tahun",
                skills: ["SQL", "Python", "Tableau", "Excel", "Statistics"],
                education: "S1 Statistika, Matematika, atau Teknik Informatika",
            },
        },
        {
            jobName: "Product Manager",
            jobType: "Full-time",
            jobDescription:
                "Kami mencari Product Manager yang berpengalaman untuk memimpin pengembangan produk digital. Kandidat harus memiliki kemampuan komunikasi yang baik dan pengalaman dalam agile methodology.",
            numberOfCandidateNeeded: 1,
            minimumSalary: "15000000",
            maximumSalary: "25000000",
            minimumProfileInformationRequired: {
                experience: "3-5 tahun",
                skills: [
                    "Product Management",
                    "Agile",
                    "User Stories",
                    "Roadmapping",
                    "Stakeholder Management",
                ],
                education: "S1 atau S2 di bidang terkait",
            },
        },
        {
            jobName: "QA Engineer",
            jobType: "Full-time",
            jobDescription:
                "Posisi QA Engineer untuk memastikan kualitas produk melalui testing manual dan automation. Pengalaman dengan Selenium, Jest, atau Cypress adalah nilai plus.",
            numberOfCandidateNeeded: 2,
            minimumSalary: "6500000",
            maximumSalary: "11000000",
            minimumProfileInformationRequired: {
                experience: "1-2 tahun",
                skills: [
                    "Manual Testing",
                    "Automation Testing",
                    "Selenium",
                    "Jest",
                    "API Testing",
                ],
                education: "S1 Teknik Informatika atau setara",
            },
        },
        {
            jobName: "Content Writer",
            jobType: "Part-time",
            jobDescription:
                "Kami membutuhkan Content Writer untuk membuat konten blog, artikel, dan copy marketing yang engaging. Kandidat harus memiliki kemampuan menulis yang baik dalam Bahasa Indonesia dan Inggris.",
            numberOfCandidateNeeded: 3,
            minimumSalary: "4000000",
            maximumSalary: "7000000",
            minimumProfileInformationRequired: {
                experience: "1 tahun",
                skills: ["Content Writing", "SEO", "Copywriting", "Research"],
                education: "S1 di bidang terkait",
            },
        },
        {
            jobName: "Digital Marketing Specialist",
            jobType: "Full-time",
            jobDescription:
                "Bergabunglah dengan tim marketing kami untuk mengelola campaign digital, social media, dan SEO. Pengalaman dengan Google Ads, Facebook Ads, dan analytics tools sangat diutamakan.",
            numberOfCandidateNeeded: 2,
            minimumSalary: "6000000",
            maximumSalary: "10000000",
            minimumProfileInformationRequired: {
                experience: "1-2 tahun",
                skills: [
                    "Digital Marketing",
                    "Google Ads",
                    "Facebook Ads",
                    "SEO",
                    "Google Analytics",
                ],
                education: "S1 Marketing, Komunikasi, atau setara",
            },
        },
    ];

    for (const job of jobs) {
        const createdJob = await prisma.job.create({
            data: {
                ...job,
                createdBy: admin.id,
            },
        });
        console.log(`✅ Job created: ${createdJob.jobName}`);
    }

    console.log("🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
