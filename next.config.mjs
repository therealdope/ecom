/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com'],
        remotePatterns: [{
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/db52gpmt7/**',
        }, ],
    }
};

export default nextConfig;