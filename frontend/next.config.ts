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
    // 2. Your existing API redirects
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/:path*',
            },
            {
                source: '/auth/:path*',
                destination: 'http://localhost:8080/auth/:path*',
            },
        ];
    },
};

export default nextConfig;