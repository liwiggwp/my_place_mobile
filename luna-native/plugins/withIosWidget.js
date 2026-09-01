const { withXcodeProject, withEntitlementsPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withIosWidget = config => {
  // Add App Group to Entitlements
  config = withEntitlementsPlist(config, modConfig => {
    modConfig.modResults['com.apple.security.application-groups'] = [
      'group.com.luna.tracker'
    ];
    return modConfig;
  });

  // Inject Widget Extension into Xcode project
  config = withXcodeProject(config, async modConfig => {
    const projectRoot = modConfig.modRequest.projectRoot;
    const widgetSourcePath = path.join(projectRoot, 'ios-widget', 'LunaWidget.swift');
    const iosDir = path.join(projectRoot, 'ios');

    // Create target directory if in prebuild
    const widgetTargetDir = path.join(iosDir, 'LunaWidget');
    if (!fs.existsSync(widgetTargetDir)) {
      fs.mkdirSync(widgetTargetDir, { recursive: true });
    }

    if (fs.existsSync(widgetSourcePath)) {
      fs.copyFileSync(widgetSourcePath, path.join(widgetTargetDir, 'LunaWidget.swift'));
    }

    return modConfig;
  });

  return config;
};

module.exports = withIosWidget;
