import fs from 'fs';
import path from 'path';

import { moveToSuccessfulUploads } from '../../../src/scripts/upload/moveToSuccessfulUploads';

jest.mock('fs');

const uploadsFolderMockedFs = fs as jest.Mocked<typeof fs>;

describe('moveToSuccessfulUploads', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('moves the folder into successfulUploads when no name collision exists', () => {
        uploadsFolderMockedFs.existsSync.mockReturnValue(false); // neither destination nor root exists yet
        uploadsFolderMockedFs.mkdirSync.mockReturnValue(undefined as any);
        uploadsFolderMockedFs.renameSync.mockReturnValue(undefined);

        moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads');

        expect(uploadsFolderMockedFs.renameSync).toHaveBeenCalledWith(
            'productsUpload/spinosaurus',
            path.join('successfulUploads', 'spinosaurus')
        );
    });

    test('creates the successfulUploads root directory if it does not exist yet', () => {
        uploadsFolderMockedFs.existsSync.mockReturnValue(false);
        uploadsFolderMockedFs.mkdirSync.mockReturnValue(undefined as any);
        uploadsFolderMockedFs.renameSync.mockReturnValue(undefined);

        moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads');

        expect(uploadsFolderMockedFs.mkdirSync).toHaveBeenCalledWith('successfulUploads', { recursive: true });
    });

    test('does not try to create the root directory if it already exists', () => {
        uploadsFolderMockedFs.existsSync.mockImplementation((p) => p.toString() === 'successfulUploads');
        uploadsFolderMockedFs.renameSync.mockReturnValue(undefined);

        moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads');

        expect(uploadsFolderMockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    test('throws if a folder with the same name already exists in successfulUploads', () => {
        uploadsFolderMockedFs.existsSync.mockImplementation((p) =>
            p.toString() === path.join('successfulUploads', 'spinosaurus')
        );

        expect(() =>
            moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads')
        ).toThrow(/already exists/i);

        expect(uploadsFolderMockedFs.renameSync).not.toHaveBeenCalled();
    });

    test('throws a descriptive error if the rename operation itself fails', () => {
        uploadsFolderMockedFs.existsSync.mockReturnValue(false);
        uploadsFolderMockedFs.mkdirSync.mockReturnValue(undefined as any);
        uploadsFolderMockedFs.renameSync.mockImplementation(() => {
            throw new Error('EACCES: permission denied');
        });

        expect(() =>
            moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads')
        ).toThrow(/failed to move/i);
    });
});