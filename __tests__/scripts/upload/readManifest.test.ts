import fs from 'fs';
import { readManifest } from '../../../src/scripts/upload/readManifest';

jest.mock('fs');
const manifestMockedFs = fs as jest.Mocked<typeof fs>;

describe('readManifest', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('reads and parses a valid manifest file', () => {
        manifestMockedFs.readFileSync.mockReturnValue(JSON.stringify({ slug: 'spinosaurus', price: 350 }));

        const manifest = readManifest('./uploads/spinosaurus/manifest.json');

        expect(manifest).toEqual({ slug: 'spinosaurus', price: 350 });
        expect(manifestMockedFs.readFileSync).toHaveBeenCalledWith('./uploads/spinosaurus/manifest.json', 'utf-8');
    });

    test('throws a descriptive error if the file cannot be read', () => {
        manifestMockedFs.readFileSync.mockImplementation(() => {
            throw new Error('ENOENT: no such file');
        });

        expect(() => readManifest('./missing/manifest.json')).toThrow(/could not read manifest file/i);
    });

    test('throws a descriptive error if the file is not valid JSON', () => {
        manifestMockedFs.readFileSync.mockReturnValue('{ not: valid json');

        expect(() => readManifest('./bad/manifest.json')).toThrow(/not valid json/i);
    });

    test('throws if the parsed JSON is an array', () => {
        manifestMockedFs.readFileSync.mockReturnValue(JSON.stringify([{ slug: 'a' }]));

        expect(() => readManifest('./array/manifest.json')).toThrow(/must be a json object/i);
    });

    test('throws if the parsed JSON is a primitive', () => {
        manifestMockedFs.readFileSync.mockReturnValue(JSON.stringify('just a string'));

        expect(() => readManifest('./primitive/manifest.json')).toThrow(/must be a json object/i);
    });
});