import { NhostClient } from '@nhost/nhost-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Nhost project details
const NHOS_SUBDOMAIN = 'kxqmkqvpluwmbxjqhppf'; // Your Nhost project subdomain
const NHOS_REGION = 'ap-south-1';             // Your Nhost project region

const nhost = new NhostClient({
  subdomain: NHOS_SUBDOMAIN, // Use subdomain
  region: NHOS_REGION,       // Use region
  clientStorageType: 'react-native',
  clientStorage: AsyncStorage,
  // autoSignIn: true, // Optional: enable auto sign-in if needed
  // autoRefreshToken: true // Optional: enable auto refresh token if needed
});

export { nhost };
