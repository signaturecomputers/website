import { adminDb } from '@/lib/firebase-admin';

export interface CategoryRedirect {
    oldSlug: string;
    newSlug: string;
    renamedAt: string;
}

/**
 * Record a category rename mapping oldSlug -> newSlug in Firestore 'category_redirects' collection.
 * Also handles chained renames (e.g. if A -> B existed, and now B -> C, updates A -> C).
 */
export async function recordCategoryRename(oldSlug: string, newSlug: string) {
    if (!oldSlug || !newSlug || oldSlug === newSlug) return;
    const oldLower = oldSlug.toLowerCase();
    const newLower = newSlug.toLowerCase();

    try {
        if (!adminDb || typeof adminDb.collection !== 'function') return;

        const batch = adminDb.batch();
        const renamedAt = new Date().toISOString();

        // 1. Direct record for oldLower -> newLower
        const directRef = adminDb.collection('category_redirects').doc(oldLower);
        batch.set(directRef, {
            oldSlug: oldLower,
            newSlug: newLower,
            renamedAt
        });

        // 2. Check for chained renames (anything that previously pointed to oldLower)
        const previousChainSnapshot = await adminDb.collection('category_redirects')
            .where('newSlug', '==', oldLower)
            .get();

        previousChainSnapshot.forEach((docSnap: any) => {
            batch.update(docSnap.ref, {
                newSlug: newLower,
                renamedAt
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error recording category rename:', error);
    }
}

/**
 * Resolve category redirect for a given slug.
 * Checks 'category_redirects' collection for oldSlug, resolving chained renames if any.
 * Returns the final newSlug if found, or null if no redirect exists.
 */
export async function resolveCategoryRedirect(slug: string): Promise<string | null> {
    if (!slug) return null;
    let currentSlug = slug.toLowerCase();
    let finalSlug: string | null = null;
    let depth = 0;
    const maxDepth = 10;

    try {
        if (!adminDb || typeof adminDb.collection !== 'function') return null;

        while (depth < maxDepth) {
            const docSnap = await adminDb.collection('category_redirects').doc(currentSlug).get();
            if (docSnap.exists) {
                const data = docSnap.data();
                if (data?.newSlug && data.newSlug.toLowerCase() !== currentSlug) {
                    currentSlug = data.newSlug.toLowerCase();
                    finalSlug = currentSlug;
                    depth++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    } catch (error) {
        console.error('Error resolving category redirect:', error);
    }

    return finalSlug;
}
