/* eslint-env mocha */

import { strict as assert } from 'assert';
import { readFile }         from 'fs/promises';
import { fileURLToPath }    from 'url';

function makePath(relativeURL)
{
    const path = fileURLToPath(new URL(relativeURL, import.meta.url));
    return path;
}

function toDataURL(sourceCodeBuffer)
{
    const base64Str = `data:text/javascript;base64,${sourceCodeBuffer.toString('base64')}`;
    return base64Str;
}

describe
(
    'core-commonjs',
    () =>
    {
        before(() => import('core-commonjs'));

        it
        (
            'can be required',
            () =>
            {
                const imports = require('core-commonjs');

                assert.equal(imports, undefined);
            },
        );

        it
        (
            'can be imported',
            async () =>
            {
                const imports = await import('core-commonjs');

                assert.deepEqual(Object.keys(imports), ['default']);
                assert.equal(imports.default, undefined);
            },
        );

        it
        (
            'defines the expected global properties',
            () =>
            {
                assert('__dirname' in globalThis);
                assert(!globalThis.propertyIsEnumerable('__dirname'));
                assert('__filename' in globalThis);
                assert(!globalThis.propertyIsEnumerable('__filename'));
                assert('require' in globalThis);
                assert(!globalThis.propertyIsEnumerable('require'));
            },
        );

        it
        (
            'from an ES module',
            async () =>
            {
                const { getDirname, getFilename, getRequire, setDirname, setFilename, setRequire } =
                await import('./modules/module.mjs');

                const __dirname     = getDirname();
                const __filename    = getFilename();
                const require       = getRequire();
                assert.equal(__dirname, makePath('./modules'));
                assert.equal(__filename, makePath('./modules/module.mjs'));
                assert.equal(require.resolve.paths('')[0], makePath('./modules/node_modules'));
                setDirname(__dirname);
                setFilename(__filename);
                setRequire(require);
            },
        );

        it
        (
            'from a CommonJS module',
            async () =>
            {
                function verifyErrorFor(identifier, caller)
                {
                    const predicate =
                    ({ constructor, message, stack }) =>
                    {
                        const expectedMessage = `${identifier} is not defined`;
                        assert.equal(constructor, ReferenceError);
                        assert.equal(message, `${identifier} is not defined`);
                        const start =
                        `ReferenceError: ${expectedMessage}\n` +
                        `    at ${caller} (${makePath('./modules/module.cjs')}:`;
                        assert(stack.startsWith(start), `Unexpected stack trace:\n${stack}`);
                        return true;
                    };
                    return predicate;
                }

                const
                {
                    default:
                    { getDirname, getFilename, getRequire, setDirname, setFilename, setRequire },
                } =
                await import('./modules/module.cjs');

                assert.throws
                (() => getDirname(),    verifyErrorFor('__dirname', 'exports.getDirname'));
                assert.throws
                (() => getFilename(),   verifyErrorFor('__filename', 'exports.getFilename'));
                assert.throws
                (() => getRequire(),    verifyErrorFor('require', 'exports.getRequire'));
                assert.throws
                (() => setDirname(42),  verifyErrorFor('__dirname', 'exports.setDirname'));
                assert.throws
                (() => setFilename(42), verifyErrorFor('__filename', 'exports.setFilename'));
                assert.throws
                (() => setRequire(42),  verifyErrorFor('require', 'exports.setRequire'));
            },
        );

        it
        (
            'from eval code',
            () =>
            {
                function verifyErrorFor(identifier)
                {
                    const predicate =
                    ({ constructor, message, stack }) =>
                    {
                        const expectedMessage = `${identifier} is not defined`;
                        assert.equal(constructor, ReferenceError);
                        assert.equal(message, expectedMessage);
                        const start =
                        `ReferenceError: ${expectedMessage}\n` +
                        `    at eval (eval at <anonymous> (${import.meta.url}:`;
                        assert(stack.startsWith(start), `Unexpected stack trace:\n${stack}`);
                        return true;
                    };
                    return predicate;
                }

                assert.throws(() => eval?.('__dirname'),        verifyErrorFor('__dirname'));
                assert.throws(() => eval?.('__filename'),       verifyErrorFor('__filename'));
                assert.throws(() => eval?.('require'),          verifyErrorFor('require'));
                assert.throws(() => eval?.('__dirname = 42'),   verifyErrorFor('__dirname'));
                assert.throws(() => eval?.('__filename = 42'),  verifyErrorFor('__filename'));
                assert.throws(() => eval?.('require = 42'),     verifyErrorFor('require'));
            },
        );

        it
        (
            'from native code',
            () =>
            {
                function verifyErrorFor(identifier, caller)
                {
                    const predicate =
                    ({ constructor, message, stack }) =>
                    {
                        const expectedMessage = `${identifier} is not defined`;
                        assert.equal(constructor, ReferenceError);
                        assert.equal(message, `${identifier} is not defined`);
                        const start1 =
                        `ReferenceError: ${expectedMessage}\n` +
                        `    at Reflect.${caller} (<anonymous>)\n` +
                        `    at ${import.meta.url}:`;
                        const start2 =
                        `ReferenceError: ${expectedMessage}\n` +
                        `    at Object.${caller} (<anonymous>)\n` +
                        `    at ${import.meta.url}:`;
                        assert
                        (
                            stack.startsWith(start1) || stack.startsWith(start2),
                            `Unexpected stack trace:\n${stack}`,
                        );
                        return true;
                    };
                    return predicate;
                }

                assert.throws
                (
                    () => Reflect.get(globalThis, '__dirname'),
                    verifyErrorFor('__dirname', 'get'),
                );
                assert.throws
                (
                    () => Reflect.get(globalThis, '__filename'),
                    verifyErrorFor('__filename', 'get'),
                );
                assert.throws
                (
                    () => Reflect.get(globalThis, 'require'),
                    verifyErrorFor('require', 'get'),
                );
                assert.throws
                (
                    () => Reflect.set(globalThis, '__dirname', 42),
                    verifyErrorFor('__dirname', 'set'),
                );
                assert.throws
                (
                    () => Reflect.set(globalThis, '__filename', 42),
                    verifyErrorFor('__filename', 'set'),
                );
                assert.throws
                (
                    () => Reflect.set(globalThis, 'require', 42),
                    verifyErrorFor('require', 'set'),
                );
            },
        );

        it
        (
            'from a data URL module',
            async () =>
            {
                function verifyErrorFor(identifier, caller)
                {
                    const predicate =
                    ({ constructor, message, stack }) =>
                    {
                        const expectedMessage = `${identifier} is not defined`;
                        assert.equal(constructor, ReferenceError);
                        assert.equal(message, `${identifier} is not defined`);
                        const start =
                        `ReferenceError: ${expectedMessage}\n` +
                        `    at ${caller} (${dataURL}:`;
                        assert(stack.startsWith(start), `Unexpected stack trace:\n${stack}`);
                        return true;
                    };
                    return predicate;
                }

                const esModuleURL = new URL('./modules/module.mjs', import.meta.url);
                const sourceCodeBuffer = await readFile(esModuleURL);
                const dataURL = toDataURL(sourceCodeBuffer);
                const { getDirname, getFilename, getRequire, setDirname, setFilename, setRequire } =
                await import(dataURL);

                assert.throws
                (() => getDirname(),    verifyErrorFor('__dirname', 'getDirname'));
                assert.throws
                (() => getFilename(),   verifyErrorFor('__filename', 'getFilename'));
                assert.throws
                (() => getRequire(),    verifyErrorFor('require', 'getRequire'));
                assert.throws
                (() => setDirname(42),  verifyErrorFor('__dirname', 'setDirname'));
                assert.throws
                (() => setFilename(42), verifyErrorFor('__filename', 'setFilename'));
                assert.throws
                (() => setRequire(42),  verifyErrorFor('require', 'setRequire'));
            },
        );

        it
        (
            'has stable per-file values',
            async () =>
            {
                const
                [
                    {
                        getDirname:     getDirname1,
                        getFilename:    getFilename1,
                        getRequire:     getRequire1,
                        setDirname:     setDirname1,
                        setFilename:    setFilename1,
                        setRequire:     setRequire1,
                    },
                    {
                        getDirname:     getDirname2,
                        getFilename:    getFilename2,
                        getRequire:     getRequire2,
                    },
                ] =
                await
                Promise.all
                ([import('./modules/module.mjs'), import('./modules/subdir/module-2.mjs')]);

                {
                    const originalValue1 = getDirname1();
                    const originalValue2 = getDirname2();
                    assert.notEqual(originalValue1, originalValue2);
                    setDirname1(42);
                    assert.equal(getDirname2(), originalValue2);
                    assert.equal(getDirname1(), 42);
                    setDirname1(originalValue1);
                }
                {
                    const originalValue1 = getFilename1();
                    const originalValue2 = getFilename2();
                    assert.notEqual(originalValue1, originalValue2);
                    setFilename1(42);
                    assert.equal(getFilename2(), originalValue2);
                    assert.equal(getFilename1(), 42);
                    setFilename1(originalValue1);
                }
                {
                    const originalValue1 = getRequire1();
                    const originalValue2 = getRequire2();
                    assert.notEqual(originalValue1, originalValue2);
                    setRequire1(42);
                    assert.equal(getRequire2(), originalValue2);
                    assert.equal(getRequire1(), 42);
                    setRequire1(originalValue1);
                }
            },
        );
    },
);
