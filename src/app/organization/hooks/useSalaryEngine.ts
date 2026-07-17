import { useMemo } from 'react';
import { SalaryComp, SalaryCalculations, CalculatedComponent } from '../types/salary';

export function useSalaryEngine(components: SalaryComp[]): SalaryCalculations {
  return useMemo(() => {
    const resolved = new Map<string, number>();
    let prevUnresolvedCount = components.length + 1;
    let unresolvedComps = [...components];

    // Dependency Resolution Loop
    while (unresolvedComps.length > 0 && unresolvedComps.length < prevUnresolvedCount) {
      prevUnresolvedCount = unresolvedComps.length;
      unresolvedComps = unresolvedComps.filter(comp => {
        let annualVal = 0;
        if (comp.calcType === 'fixed') {
          annualVal = comp.value * 12; // value is monthly
        } else if (comp.calcType === 'formula') {
          const baseIds = comp.formulaBaseIds || [];
          const allResolved = baseIds.every(id => resolved.has(id));
          if (!allResolved) return true; // Keep in unresolved
          
          const baseSum = baseIds.reduce((sum, id) => sum + (resolved.get(id) || 0), 0);
          annualVal = (baseSum * comp.value) / 100;
        }
        resolved.set(comp.id, annualVal);
        return false; // Remove from unresolved
      });
    }

    // Assign 0 to circular/broken dependencies
    unresolvedComps.forEach(comp => resolved.set(comp.id, 0));

    const calculatedComponents: CalculatedComponent[] = components.map(comp => {
      const annualVal = resolved.get(comp.id) || 0;
      return { ...comp, annualVal, monthlyVal: annualVal / 12 };
    });

    const totalEarnings = calculatedComponents.filter(c => c.type === 'earning').reduce((acc, c) => acc + c.annualVal, 0);
    const totalDeductions = calculatedComponents.filter(c => c.type === 'deduction').reduce((acc, c) => acc + c.annualVal, 0);
    const totalEmployer = calculatedComponents.filter(c => c.type === 'employer_contribution').reduce((acc, c) => acc + c.annualVal, 0);
    
    const grossMonthly = totalEarnings / 12;
    const netMonthly = (totalEarnings - totalDeductions) / 12;
    const computedCTC = totalEarnings + totalEmployer;

    return {
      computedCTC,
      calculatedComponents,
      grossMonthly,
      netMonthly,
      totalEarnings,
      totalDeductions,
      totalEmployer,
      unresolvedComps
    };
  }, [components]);
}
