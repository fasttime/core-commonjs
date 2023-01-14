'use strict';

const { createRequire } = require('module');
const { dirname }       = require('path');
const { fileURLToPath } = require('url');

const _Error_captureStackTrace = Error.captureStackTrace;

function createAccessor(fn, identifier)
{
    const accessor =
    (...args) =>
    {
        const fileSlot = findFileSlotForCaller(accessor);
        const returnValue = fn(fileSlot, ...args);
        return returnValue;
    };
    Object.defineProperty(accessor, 'identifier', { __proto__: null, value: identifier });
    return accessor;
}

function defineCJS(identifier, getter, setter)
{
    const get = createAccessor(getter, identifier);
    const set = createAccessor(setter, identifier);
    Object.defineProperty
    (globalThis, identifier, { __proto__: null, configurable: true, enumerable: false, get, set });
}

const fileSlotMap = { __proto__: null };

function findFileSlotForCaller(constructorOpt)
{
    let fileName;
    {
        const { prepareStackTrace } = Error;
        Error.prepareStackTrace =
        (_, [callSite]) =>
        {
            fileName = callSite.getFileName();
        };
        const targetObject = { __proto__: null };
        const originalStackTraceLimit = Error.stackTraceLimit;
        Error.stackTraceLimit = 1;
        _Error_captureStackTrace(targetObject, constructorOpt);
        Error.stackTraceLimit = originalStackTraceLimit;
        void targetObject.stack;
        Error.prepareStackTrace = prepareStackTrace;
    }
    if (fileName == null || !fileName.startsWith('file:'))
    {
        const { identifier } = constructorOpt;
        const error = new ReferenceError(`${identifier} is not defined`);
        _Error_captureStackTrace(error, constructorOpt);
        throw error;
    }
    fileName = fileURLToPath(fileName);
    const fileSlot =
    fileSlotMap[fileName] || (fileSlotMap[fileName] = { __proto__: null, fileName });
    return fileSlot;
}

function getDirname(fileSlot)
{
    const __dirname =
    '__dirname' in fileSlot ? fileSlot.__dirname : fileSlot.__dirname = dirname(fileSlot.fileName);
    return __dirname;
}

function getFilename(fileSlot)
{
    const __filename =
    '__filename' in fileSlot ? fileSlot.__filename : fileSlot.__filename = fileSlot.fileName;
    return __filename;
}

function getRequire(fileSlot)
{
    const require =
    'require' in fileSlot ? fileSlot.require : fileSlot.require = createRequire(fileSlot.fileName);
    return require;
}

function setDirname(fileSlot, value)
{
    fileSlot.__dirname = value;
}

function setFilename(fileSlot, value)
{
    fileSlot.__filename = value;
}

function setRequire(fileSlot, value)
{
    fileSlot.require = value;
}

defineCJS('__dirname', getDirname, setDirname);
defineCJS('__filename', getFilename, setFilename);
defineCJS('require', getRequire, setRequire);

module.exports = undefined;
