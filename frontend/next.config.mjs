/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone', // BẮT BUỘC

    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

export default nextConfig
