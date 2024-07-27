import { db } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { doc } from 'firebase/firestore';
import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
}));

describe('getFirestoreDocRef', () => {
  it('should return a valid document reference when given collection name and UID', () => {
    const mockCollectionName = 'tests';
    const mockUid = '12345';
    const mockDocRef = { id: mockUid, path: `${mockCollectionName}/${mockUid}` };

    const mockDocRefAction = vi.fn().mockReturnValue(mockDocRef);
    vi.mocked(doc).mockImplementation(mockDocRefAction);

    const result = getFirestoreDocRef(mockCollectionName, mockUid);

    expect(doc).toHaveBeenCalledWith(db, mockCollectionName, mockUid);
    expect(result).toEqual({ id: '12345', path: `tests/12345` });
    // expect(result).toEqual(mockDocRef);
  });
});
