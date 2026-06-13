/**
 * Cloudinary image optimisation helpers.
 *
 * The backend already normalises Cloudinary URLs via
 * `normalizeCloudinaryDeliveryUrl`. On the web client we add
 * a width + quality + format transform to reduce payload by ~60%.
 *
 * Usage:
 *   <Image src={cloudinaryUrl(product.thumbnail_url, 400)} ... />
 */

const CLOUDINARY_ORIGIN = 'res.cloudinary.com'

/**
 * Add width, quality, and format auto-transforms to a Cloudinary URL.
 * Leaves non-Cloudinary URLs untouched.
 *
 * @param url    - Original Cloudinary delivery URL (may be null/undefined)
 * @param width  - Target display width in CSS pixels (default 400)
 */
export function cloudinaryUrl(
    url: string | null | undefined,
    width = 400,
): string {
    if (!url || !url.includes(CLOUDINARY_ORIGIN)) return url ?? ''

    // Already has transforms — inject our params right after /upload/
    // Cloudinary URL pattern: .../upload/[optional-transforms]/v.../file
    const uploadMarker = '/upload/'
    const idx = url.indexOf(uploadMarker)
    if (idx === -1) return url

    const before = url.slice(0, idx + uploadMarker.length)
    const after = url.slice(idx + uploadMarker.length)

    // Don't double-add transforms if they're already present
    if (after.startsWith('q_auto') || after.startsWith('f_auto') || after.startsWith('w_')) {
        return url
    }

    const transforms = `q_auto,f_auto,w_${width},dpr_auto/`
    return `${before}${transforms}${after}`
}

/**
 * Thumbnail variant — 200px, suitable for 40–100px rendered sizes (cards).
 */
export const thumbUrl = (url: string | null | undefined) => cloudinaryUrl(url, 200)

/**
 * Card variant — 400px, suitable for product cards.
 */
export const cardUrl = (url: string | null | undefined) => cloudinaryUrl(url, 400)

/**
 * Full variant — 800px, suitable for product gallery.
 */
export const galleryUrl = (url: string | null | undefined) => cloudinaryUrl(url, 800)
