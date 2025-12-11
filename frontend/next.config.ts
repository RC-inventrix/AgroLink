import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                // 1. Redirect calls from /api/x to http://localhost:8080/x
                // Example: /api/auth/login -> http://localhost:8080/auth/login
                source: '/api/:path*',
                destination: 'http://localhost:8080/:path*',
            },
            {
                // 2. Catch direct calls to /auth/x just in case
                source: '/auth/:path*',
                destination: 'http://localhost:8080/auth/:path*',
            },
        ];
    },
};

export default nextConfig;