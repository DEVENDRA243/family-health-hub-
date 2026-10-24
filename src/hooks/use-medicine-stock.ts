import { useState, useEffect, useCallback } from "react";
import { Medicine } from "@/types/health";

export interface MedicineStockInfo {
  medicineId: string;
  pillsRemaining: number;
  refillThreshold: number;
  unit: string;
  lastRefilledAt?: string;
}

const STORAGE_KEY_PREFIX = "family_medicine_stock_";
const STOCK_EVENT_NAME = "family_medicine_stock_updated";

/**
 * Helper to read stock data from local storage
 */
export function getStoredStock(medicineId: string, defaultStock = 30, defaultThreshold = 5, defaultUnit = "tablets"): MedicineStockInfo {
  if (typeof window === "undefined") {
    return {
      medicineId,
      pillsRemaining: defaultStock,
      refillThreshold: defaultThreshold,
      unit: defaultUnit,
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${medicineId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Error reading medicine stock:", err);
  }

  // Default initial configuration if none set yet
  return {
    medicineId,
    pillsRemaining: defaultStock,
    refillThreshold: defaultThreshold,
    unit: defaultUnit,
  };
}

/**
 * Helper to save stock data and broadcast change event to all components
 */
export function saveStock(info: MedicineStockInfo) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${info.medicineId}`, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent(STOCK_EVENT_NAME, { detail: info }));
  } catch (err) {
    console.error("Error saving medicine stock:", err);
  }
}

/**
 * Decrement stock by 1 when a dose is taken
 */
export function decrementMedicineStock(medicineId: string, amount = 1) {
  const current = getStoredStock(medicineId);
  const updated: MedicineStockInfo = {
    ...current,
    pillsRemaining: Math.max(0, current.pillsRemaining - amount),
  };
  saveStock(updated);
  return updated;
}

/**
 * Increment stock by 1 when a taken dose is undone
 */
export function incrementMedicineStock(medicineId: string, amount = 1) {
  const current = getStoredStock(medicineId);
  const updated: MedicineStockInfo = {
    ...current,
    pillsRemaining: current.pillsRemaining + amount,
  };
  saveStock(updated);
  return updated;
}

/**
 * Refill medicine stock (e.g. +30 pills)
 */
export function refillMedicineStock(medicineId: string, additionalPills: number) {
  const current = getStoredStock(medicineId);
  const updated: MedicineStockInfo = {
    ...current,
    pillsRemaining: current.pillsRemaining + additionalPills,
    lastRefilledAt: new Date().toISOString(),
  };
  saveStock(updated);
  return updated;
}

/**
 * Reactive React hook to observe and update stock for a specific medicine
 */
export function useMedicineStock(medicineId: string, initialPills = 30) {
  const [stock, setStockState] = useState<MedicineStockInfo>(() =>
    getStoredStock(medicineId, initialPills)
  );

  useEffect(() => {
    // Initial fetch
    setStockState(getStoredStock(medicineId, initialPills));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MedicineStockInfo>;
      if (customEvent.detail && customEvent.detail.medicineId === medicineId) {
        setStockState(customEvent.detail);
      }
    };

    window.addEventListener(STOCK_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", () => setStockState(getStoredStock(medicineId, initialPills)));

    return () => {
      window.removeEventListener(STOCK_EVENT_NAME, handleUpdate);
    };
  }, [medicineId, initialPills]);

  const updateStock = useCallback(
    (updates: Partial<Omit<MedicineStockInfo, "medicineId">>) => {
      const updated: MedicineStockInfo = {
        ...stock,
        ...updates,
        medicineId,
      };
      saveStock(updated);
      setStockState(updated);
    },
    [stock, medicineId]
  );

  const refill = useCallback(
    (count: number) => {
      const updated = refillMedicineStock(medicineId, count);
      setStockState(updated);
    },
    [medicineId]
  );

  const isLowStock = stock.pillsRemaining <= stock.refillThreshold && stock.pillsRemaining > 0;
  const isOutOfStock = stock.pillsRemaining <= 0;

  return {
    stock,
    pillsRemaining: stock.pillsRemaining,
    refillThreshold: stock.refillThreshold,
    unit: stock.unit,
    isLowStock,
    isOutOfStock,
    updateStock,
    refill,
  };
}

/**
 * Hook to scan all medicines in the family and detect any that need refilling
 */
export function useLowStockMedicines(medicines?: Medicine[]) {
  const [lowStockList, setLowStockList] = useState<Array<{ medicine: Medicine; stock: MedicineStockInfo }>>([]);

  const recalculate = useCallback(() => {
    if (!medicines || medicines.length === 0) {
      setLowStockList([]);
      return;
    }

    const low: Array<{ medicine: Medicine; stock: MedicineStockInfo }> = [];
    for (const med of medicines) {
      const stock = getStoredStock(med.id);
      if (stock.pillsRemaining <= stock.refillThreshold) {
        low.push({ medicine: med, stock });
      }
    }
    setLowStockList(low);
  }, [medicines]);

  useEffect(() => {
    recalculate();

    const handleUpdate = () => recalculate();
    window.addEventListener(STOCK_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(STOCK_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [recalculate]);

  return lowStockList;
}
