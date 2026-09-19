const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Cleartext (plain HTTP) is only ever needed to reach a local dev backend:
// the Android emulator's host-loopback alias, or localhost when running
// inside a container/WSL setup that proxies to it. Everything else on the
// device — including a misconfigured production API host — must use TLS.
const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
`;

/**
 * Replaces the blanket `android:usesCleartextTraffic="true"` (which allows
 * plain HTTP to ANY host) with a network security config that only allows it
 * for the handful of addresses a local dev backend can be reached at.
 */
function withScopedCleartextTraffic(config) {
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    delete application.$['android:usesCleartextTraffic'];
    return config;
  });

  config = withDangerousMod(config, [
    'android',
    (config) => {
      const xmlDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(path.join(xmlDir, 'network_security_config.xml'), NETWORK_SECURITY_CONFIG_XML);
      return config;
    },
  ]);

  return config;
}

module.exports = withScopedCleartextTraffic;
