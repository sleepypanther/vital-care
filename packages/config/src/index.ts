export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/healthcare',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  s3Endpoint: process.env.S3_ENDPOINT || '',
  s3Bucket: process.env.S3_BUCKET || 'healthcare-docs',
  s3AccessKey: process.env.S3_ACCESS_KEY || '',
  s3SecretKey: process.env.S3_SECRET_KEY || '',
};

export const isDev = env.nodeEnv === 'development';
export const isProd = env.nodeEnv === 'production';
