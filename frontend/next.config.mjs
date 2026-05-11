/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    output: 'standalone', // BẮT BUỘC

    images: {
        unoptimized: true,
    },
}

export default nextConfig
