import fs from 'fs';
import path from 'path';

import { discoverEntryFolders } from '../../../src/scripts/upload/discoverEntryFolders';

jest.mock('fs');

const discoverFoldersMockedFs = fs as jest.Mocked<typeof fs>;

describe('discoverEntryFolders', () => {
    function dirent(name: string, isDirectory: boolean): fs.Dirent {
        return { name, isDirectory: () => isDirectory } as unknown as fs.Dirent;
    }
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('returns folder paths for subfolders that contain a manifest.json', () => {
        discoverFoldersMockedFs.readdirSync.mockReturnValue([
            dirent('spinosaurus', true),
            dirent('trex', true),
            dirent('README.md', false),
        ] as any);

        discoverFoldersMockedFs.existsSync.mockImplementation((p) => {
            const pathStr = p.toString();
            return pathStr.includes('spinosaurus') || pathStr.includes('trex');
        });

        const result = discoverEntryFolders('./uploads');

        expect(result).toEqual([path.join('./uploads', 'spinosaurus'), path.join('./uploads', 'trex')]);
    });

    test('excludes subfolders with no manifest.json', () => {
        discoverFoldersMockedFs.readdirSync.mockReturnValue([
            dirent('spinosaurus', true),
            dirent('incomplete-folder', true),
        ] as any);

        discoverFoldersMockedFs.existsSync.mockImplementation((p) => p.toString().includes('spinosaurus'));

        const result = discoverEntryFolders('./uploads');

        expect(result).toEqual([path.join('./uploads', 'spinosaurus')]);
    });

    test('excludes non-directory entries entirely, regardless of manifest presence', () => {
        discoverFoldersMockedFs.readdirSync.mockReturnValue([dirent('stray-file.json', false)] as any);
        discoverFoldersMockedFs.existsSync.mockReturnValue(true);

        const result = discoverEntryFolders('./uploads');

        expect(result).toEqual([]);
    });

    test('returns an empty array when the root has no matching subfolders', () => {
        discoverFoldersMockedFs.readdirSync.mockReturnValue([]);

        const result = discoverEntryFolders('./uploads');

        expect(result).toEqual([]);
    });

    test('throws a descriptive error if the root directory cannot be read', () => {
        discoverFoldersMockedFs.readdirSync.mockImplementation(() => {
            throw new Error('ENOENT: no such directory');
        });

        expect(() => discoverEntryFolders('./missing-root')).toThrow(/could not read root uploads directory/i);
    });
});

