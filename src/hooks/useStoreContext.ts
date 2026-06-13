'use client'

import { useStoreContext as _useStore } from '@/store/store.context'

export function useAllocatedStoreId() { return _useStore((s) => s.allocatedStoreId) }
export function useAllocatedStoreName() { return _useStore((s) => s.allocatedStoreName) }
export function useStoreStatus() { return _useStore((s) => s.storeStatus) }
export function useServiceable() { return _useStore((s) => s.serviceable) }
export function useIsResolving() { return _useStore((s) => s.isResolving) }
export function useResolutionError() { return _useStore((s) => s.resolutionError) }
export function useDeliveryEta() { return _useStore((s) => s.deliveryEta) }
export function useMinimumOrder() { return _useStore((s) => s.minimumOrder) }
export function useSelectedPincode() { return _useStore((s) => s.selectedPincode) }
export function useAutoAssign() { return _useStore((s) => s.autoAssign) }
export function useRecomputeFromAddress() { return _useStore((s) => s.recomputeFromAddress) }
export function useClearStore() { return _useStore((s) => s.clearStore) }
export function useGuardUserChange() { return _useStore((s) => s.guardUserChange) }
export function useFullStoreContext() { return _useStore() }
