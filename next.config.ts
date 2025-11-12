import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '127.0.0.1:3000', 
    'localhost:3000', 
    '192.168.2.36:3000',
    '192.168.2.36',
    '37.27.181.216:3000',
    '37.27.181.216',
    'http://37.27.181.216',
    'http://37.27.181.216:3000',
    'http://192.168.2.36',
    'http://192.168.2.36:3000',
    'https://therock.saashq.org',
  ],
  
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
       ...config.resolve.alias,
       handlebars: "handlebars/dist/cjs/handlebars",
    };
    
    // Optimize memory usage
    config.optimization = {
      ...config.optimization,
      minimize: false, // Disable minification in dev to save memory
    };
    
    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      };
      
      // Mark these as external to prevent bundling
      config.externals = config.externals || [];
      config.externals.push({
        redis: 'commonjs redis',
        '@redis/client': 'commonjs @redis/client',
        'cachified-redis-adapter': 'commonjs cachified-redis-adapter',
      });
    }
    
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },  

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Optimize compilation
  reactStrictMode: true,
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
  
  redirects: async () => {
    return [
      {
        source: "/buy-now",
        destination: "/pricing",
        permanent: true,
      },
    ];
  },

  turbopack: {
    resolveAlias: {
      handlebars: "handlebars/dist/cjs/handlebars",
    },
  },
  
  // Ensure server-only modules are not bundled for client
  serverExternalPackages: ['redis', '@redis/client', 'cachified-redis-adapter', '@prisma/client'],
};

export default nextConfig;
