import SftpClient from "ssh2-sftp-client";
import path from "path";

const BASE_ENV_KEYS = ["SYNOLOGY_HOST", "SYNOLOGY_SFTP_PORT", "SYNOLOGY_USER", "SYNOLOGY_PASSWORD"];

export function hasSynologyConfig(extraKeys = []) {
  return [...BASE_ENV_KEYS, ...extraKeys].every((key) => !!process.env[key]);
}

export async function uploadToSynology(localFilePath, remoteFilePath) {
  const sftp = new SftpClient();

  await sftp.connect({
    host: process.env.SYNOLOGY_HOST,
    port: Number(process.env.SYNOLOGY_SFTP_PORT),
    username: process.env.SYNOLOGY_USER,
    password: process.env.SYNOLOGY_PASSWORD,
  });

  try {
    const normalizedPath = remoteFilePath.startsWith("/") ? remoteFilePath : `/${remoteFilePath}`;
    const remoteDir = path.posix.dirname(normalizedPath);
    await sftp.mkdir(remoteDir, true);
    await sftp.put(localFilePath, normalizedPath);
    return normalizedPath;
  } finally {
    await sftp.end();
  }
}
