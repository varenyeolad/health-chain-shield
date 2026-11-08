#!/usr/bin/env node
/**
 * Generate a Caliper 0.6.0 Fabric Gateway profile for the official 2-org test network.
 * Enrollment files are referenced by path only and are never committed.
 * Usage: FABRIC_SAMPLES=/abs/path/to/fabric-samples node scripts/caliper-network-profile.mjs
 */
import { existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const samples = process.env.FABRIC_SAMPLES;
if (!samples || !samples.startsWith('/')) throw new Error('FABRIC_SAMPLES must be an absolute Linux path');
const root = resolve(samples, 'test-network/organizations/peerOrganizations/org1.example.com');
function firstFile(directory) {
  const values = readdirSync(directory).filter(x => !x.startsWith('.')).sort();
  if (values.length !== 1) throw new Error('Expected one identity file in ' + directory);
  const path = join(directory, values[0]);
  if (!existsSync(path)) throw new Error('Identity file missing: ' + path);
  return path;
}
const privateKey = firstFile(join(root, 'users/User1@org1.example.com/msp/keystore'));
const certificate = firstFile(join(root, 'users/User1@org1.example.com/msp/signcerts'));
const tls = join(root, 'peers/peer0.org1.example.com/tls/ca.crt');
if (!existsSync(tls)) throw new Error('Peer TLS certificate missing: ' + tls);
const quote = value => JSON.stringify(value);
const out = resolve(fileURLToPath(new URL('../benchmarks/caliper/network.local.yaml', import.meta.url)));
const yaml = `name: Health Chain Shield (real Fabric 2.5 test network)
version: "2.0.0"
caliper:
  blockchain: fabric
  sutOptions:
    mutualTls: false
channels:
  - channelName: healthchannel
    contracts:
      - id: healthchain
organizations:
  - mspid: Org1MSP
    identities:
      certificates:
        - name: User1
          clientPrivateKey:
            path: ${quote(privateKey)}
          clientSignedCert:
            path: ${quote(certificate)}
    peers:
      - endpoint: localhost:7051
        grpcOptions:
          ssl-target-name-override: peer0.org1.example.com
        tlsCACerts:
          path: ${quote(tls)}
`;
mkdirSync(resolve(out, '..'), { recursive: true });
writeFileSync(out, yaml);
console.log('Caliper Fabric Gateway profile generated at ' + out + ' (contains local identity paths only)');
