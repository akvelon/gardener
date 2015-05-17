#!/usr/bin/env node

module.exports = function (context) {
    var shell = context.requireCordovaModule('shelljs');
    shell.sed('-i',
        '<Content Include="alljoyn_unity_native.dll" />',
        '<Content Include="alljoyn_unity_native.dll">\n' +
        '\t\t\t<CopyToOutputDirectory>Always</CopyToOutputDirectory>\n' +
        '\t\t</Content>',
        'platforms/windows/CordovaApp.projitems');
};
