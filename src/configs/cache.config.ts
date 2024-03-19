import { CacheModuleOptions } from '@nestjs/cache-manager';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'cache',
  () =>
    ({
      isGlobal: true,
      ttl: 60 * 1000,
    }) as CacheModuleOptions,
);
