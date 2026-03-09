import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 1. Allow images from AWS S3
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'agrolink-dev-images.s3.ap-south-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    reactStrictMode: false,
    // 2. Enable standalone output for Docker deployment
    output: 'standalone',
    // 3. Your existing API redirects
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/:path*`,
            },
            {
                source: '/auth/:path*',
                destination: `${apiUrl}/auth/:path*`,
            },
        ];
    },
};

export default nextConfig;
