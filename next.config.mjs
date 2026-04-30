/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["ssh2-sftp-client", "ssh2", "cpu-features", "bcrypt"],
};

export default nextConfig;
