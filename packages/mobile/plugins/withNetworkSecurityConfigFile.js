const { withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">192.168.0.105</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
    </domain-config>
</network-security-config>
`;

module.exports = function withNetworkSecurityConfigFile(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res'
      );
      const xmlDir = path.join(resDir, 'xml');

      // Crear directorio xml si no existe
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // Escribir el archivo network_security_config.xml
      const configPath = path.join(xmlDir, 'network_security_config.xml');
      fs.writeFileSync(configPath, networkSecurityConfig);

      return config;
    },
  ]);
};
