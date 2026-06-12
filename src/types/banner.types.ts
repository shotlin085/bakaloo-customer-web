export type BannerLinkType = 'category' | 'product' | 'url' | 'none'

export interface Banner {
    id: string
    title: string | null
    subtitle?: string | null
    image_url: string
    link_type: BannerLinkType
    link_value: string | null
    sort_order: number
}
