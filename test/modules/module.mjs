export function getDirname()
{
    return __dirname;
}

export function getFilename()
{
    return __filename;
}

export function getRequire()
{
    return require;
}

export function setDirname(value)
{
    __dirname = value; // eslint-disable-line no-global-assign
}

export function setFilename(value)
{
    __filename = value; // eslint-disable-line no-global-assign
}

export function setRequire(value)
{
    require = value; // eslint-disable-line no-global-assign
}
