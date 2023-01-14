'use strict';

exports.getDirname =
() => globalThis.__dirname;

exports.getFilename =
() => globalThis.__filename;

exports.getRequire =
() => globalThis.require;

exports.setDirname =
value =>
{
    globalThis.__dirname = value;
};

exports.setFilename =
value =>
{
    globalThis.__filename = value;
};

exports.setRequire =
value =>
{
    globalThis.require = value;
};
