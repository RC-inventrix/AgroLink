import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    // 1. Allow images from AWS S3
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_S3_HOSTNAME || 'agrolink-dev-images.s3.ap-south-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    reactStrictMode: false,
    // 2. Your existing API redirects
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/:path*`,
            },
            {
                source: '/auth/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/:path*`,
            },
        ];
    },
};

export default nextConfig;