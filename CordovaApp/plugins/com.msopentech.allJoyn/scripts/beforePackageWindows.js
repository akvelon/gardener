#!/usr/bin/env node

module.exports = function(ctx) {

    var chipArch = parseTargetChipArch(ctx);

    var path = ctx.requireCordovaModule('path');
    var shell = ctx.requireCordovaModule('shelljs');

    var src = path.join(ctx.opts.plugin.dir, nativeLibPathForArch(chipArch)),
        dest = path.join(ctx.opts.wwwPath, '../alljoyn_unity_native.dll');

    console.log('Updating native AllJoyn dll to match target chip architecture:');
    console.log(src + ' -> ' + dest);

    shell.cp('-f', src, dest);
};

function parseTargetChipArch(ctx) {
    var buildArgs = ctx.cmdLine;
    if (buildArgs.indexOf('--archs=x64') !== -1) {
        return 'x64';
    }
    if (buildArgs.indexOf('--archs=x86') !== -1) {
        return 'x86';
    }

    console.warn('Can\'t detect target chip architecture.\n' +
        'Cordova AllJoyn Plugin requires x86 or x64 target chip architecture.\n' +
        'Please use --archs=x86 or --archs=x64 build argument.');

    return '';

}

function nativeLibPathForArch(chipArch) {
    return 'src/windows/libs/' + chipArch+ '/alljoyn_unity_native.dll';
}
