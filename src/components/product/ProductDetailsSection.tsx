'use client'

import { useState } from 'react'
import { Leaf, AlertTriangle, Package, Snowflake, Award } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import type { Product } from '@/types/product.types'

interface ProductDetailsSectionProps {
    product: Product
}

interface DetailItem {
    icon: React.ElementType
    label: string
    value: string
}

export function ProductDetailsSection({ product }: ProductDetailsSectionProps) {
    const [openSections, setOpenSections] = useState({
        product: true,
        certifications: true,
        nutrition: false,
    })

    const details: DetailItem[] = []

    if (product.ingredients) details.push({ icon: Leaf, label: 'Ingredients', value: product.ingredients })
    if (product.allergen_info) details.push({ icon: AlertTriangle, label: 'Allergen Info', value: product.allergen_info })
    if (product.shelf_life) details.push({ icon: Package, label: 'Shelf Life', value: product.shelf_life })
    if (product.storage_instructions) details.push({ icon: Snowflake, label: 'Storage', value: product.storage_instructions })

    const certifications = product.certifications?.filter(Boolean) ?? []
    const nutrition = product.nutrition_info ?? null

    const hasContent = details.length > 0 || certifications.length > 0 || (nutrition && Object.keys(nutrition).length > 0)

    if (!hasContent) return null

    return (
        <section className="space-y-3">
            {details.length > 0 && (
                <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white">
                    <button
                        type="button"
                        onClick={() => setOpenSections((prev) => ({ ...prev, product: !prev.product }))}
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-900">About this product</p>
                            <p className="mt-1 text-xs text-gray-500">Ingredients, shelf life, storage, and care</p>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${openSections.product ? 'rotate-180' : ''}`}
                            strokeWidth={1.7}
                        />
                    </button>
                    {openSections.product && (
                        <div className="grid gap-3 border-t border-gray-100 p-4 sm:grid-cols-2">
                            {details.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[var(--shop-surface)] p-4"
                                    >
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                            <Icon className="h-4 w-4" strokeWidth={1.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                {item.label}
                                            </p>
                                            <p className="mt-0.5 text-sm leading-relaxed text-gray-700">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {certifications.length > 0 && (
                <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenSections((prev) => ({ ...prev, certifications: !prev.certifications }))
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Certifications</p>
                            <p className="mt-1 text-xs text-gray-500">Quality and sourcing marks for this item</p>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${openSections.certifications ? 'rotate-180' : ''}`}
                            strokeWidth={1.7}
                        />
                    </button>
                    {openSections.certifications && (
                        <div className="border-t border-gray-100 px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                                {certifications.map((cert) => (
                                    <span
                                        key={cert}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                                    >
                                        <Award className="h-3 w-3" strokeWidth={1.5} />
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {nutrition && Object.keys(nutrition).length > 0 && (
                <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white">
                    <button
                        type="button"
                        onClick={() => setOpenSections((prev) => ({ ...prev, nutrition: !prev.nutrition }))}
                        className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Nutrition facts</p>
                            <p className="mt-1 text-xs text-gray-500">Expanded values for quick label-style scanning</p>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${openSections.nutrition ? 'rotate-180' : ''}`}
                            strokeWidth={1.7}
                        />
                    </button>
                    {openSections.nutrition && (
                        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-4 sm:grid-cols-3 md:grid-cols-4">
                            {Object.entries(nutrition).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="rounded-xl border border-gray-100 bg-[var(--shop-surface)] px-3 py-3 text-center"
                                >
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                        {key.replace(/_/g, ' ')}
                                    </p>
                                    <p className="mt-1 text-base font-bold text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
