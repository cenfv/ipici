import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ipici',
  slug: 'ipici',
  version: '1.0.0',
  orientation: 'portrait',
  extra: {
    API_URL: process.env.API_URL,
  },
});
