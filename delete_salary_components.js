// Bulk deletion script for salary components
// Usage: node delete_salary_components.js [TOKEN] [CUSTOM_URL]

const token = process.argv[2] || "";
const customUrl = process.argv[3] || process.env.PROD_ENDPOINT || process.env.NEXT_PUBLIC_API_BASE_URL || "http://dev-int.ismart.org/";

// Exact user-defined sequence of component codes
const DESIRED_SEQUENCE = [
  "BASIC", "DA", "HRA", "CONVEYANCE", "WASHING_ALLOWANCE", "OTHER_ALLOWANCE", "OVERTIME", "LEAVE_WITH_WAGES",
  "EX_GRATIA", "CCA", "EDUCATIONAL_ALLOWANCE", "MEDICAL_ALLOWANCE", "OT_AMOUNT", "PAID_HOLIDAY", "SPL_ALLOWANCE",
  "WEEKLY_OFF", "GRATUITY", "REIMBURSEMENT", "LTC", "BONUS", "ATTIRE", "MEAL", "LTA", "CONSOLIDATED_WAGES_1",
  "CONSOLIDATED_WAGES_2", "BASIC_DA_ARREARS", "OTHER_ARREARS", "SITE_ALLOWANCE", "HOLIDAY_ALLOWANCE",
  "LEAVE_ENCASHMENT", "P_OT", "CONY", "BONUS_Q_Y", "P_HOLIDAY", "LTA_M", "EX_GRATIA_Q_Y", "FIXED_COMPENSATION",
  "PERFORMANCE_ALLOWANCE", "MEDICAL_REM_MER", "CAR_REPAIR_RMB", "BOOK_PERIODICAL_RMB", "WASHING_ALLOWANCE_ARREARS",
  "PLI", "MEDICAL_INS_REB", "FOOD_ALLOWANCE", "SUBSISTENCE_ALLOWANCE", "FIXED_LTA_PA", "FIXED_MEAL_CARD",
  "FIXED_MEDICAL_RMB", "FIXED_PLI_PA", "FIXED_MEDICAL_INS_REB", "FIXED_CAR_REPAIR_RMB", "FIXED_BOOK_PERIODICAL_RMB",
  "FIXED_TELEPHONE_RMB", "TELEPHONE_REB", "CASH_RISK_ALLOWANCE", "BA_OT_FD", "INCENTIVE", "FOOD", "WO_ALLOWANCE",
  "METRO_CITY_ALLOWANCE", "ROOM_RENT_REIMB", "BASIC_DA_ADVANCE", "OTHER_ADVANCE", "HRA_ADVANCE", "MOBILE_ALLOWANCE",
  "STIPEND", "PF", "ESIC", "PT", "LWF", "LOAN", "ADVANCE", "TDS", "FINE", "OTHER_DEDUCTION", "PENALTY",
  "MEDICAL_INSURANCE", "LOAN_ADV_RECOVERY", "GRATUITY_PROVISION", "BENEVOLENT_F", "STAFF_WELFARE_FUND",
  "BACKGROUND_VERIFICATION", "VOLUNTARY_PROVIDENT_FUND", "EMPLOYER_PF", "EMPLOYER_ESIC", "EMPLOYER_GRATUITY",
  "MEDICLAIM", "EMPLOYER_BONUS", "EMPLOYER_LEAVE_WITH_WAGES"
];

function getCandidateUrls(inputUrl) {
  let base = inputUrl.trim();
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }

  const candidates = [];
  if (base.endsWith("/api/masters/salary-components") || base.endsWith("/masters/salary-components")) {
    candidates.push(base);
  } else {
    const cleanBase = base.replace(/\/$/, "");
    candidates.push(`${cleanBase}/api/masters/salary-components`);
    candidates.push(`${cleanBase}/masters/salary-components`);
    
    if (cleanBase.endsWith("/payroll")) {
      const stripped = cleanBase.replace(/\/payroll$/, "");
      candidates.push(`${stripped}/api/masters/salary-components`);
      candidates.push(`${stripped}/masters/salary-components`);
    }
  }

  return candidates;
}

async function fetchExistingComponents(candidateUrls, headers) {
  for (const url of candidateUrls) {
    try {
      console.log(`Attempting to fetch salary components from: ${url}`);
      const res = await fetch(url, { method: "GET", headers });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json?.results)
          ? json.results
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        return { list, activeUrl: url };
      }
    } catch (err) {
      // Try next candidate URL
    }
  }
  return { list: [], activeUrl: candidateUrls[0] };
}

async function deleteSalaryComponents() {
  const candidateUrls = getCandidateUrls(customUrl);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`Starting bulk deletion of salary components in exact user sequence...`);
  console.log(`Candidate Target URLs:`, candidateUrls);

  const { list: fetchedList, activeUrl } = await fetchExistingComponents(candidateUrls, headers);

  if (fetchedList.length === 0) {
    console.log(`No existing salary components found at candidates, or endpoint returned empty.`);
    return;
  }

  // Sort fetched components according to DESIRED_SEQUENCE
  const componentsToDelete = [...fetchedList].sort((a, b) => {
    const codeA = (a.code || "").toUpperCase();
    const codeB = (b.code || "").toUpperCase();
    const idxA = DESIRED_SEQUENCE.indexOf(codeA);
    const idxB = DESIRED_SEQUENCE.indexOf(codeB);
    const posA = idxA !== -1 ? idxA : 999;
    const posB = idxB !== -1 ? idxB : 999;
    return posA - posB;
  });

  console.log(`Found ${componentsToDelete.length} salary component(s) to delete from ${activeUrl}.\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < componentsToDelete.length; i++) {
    const comp = componentsToDelete[i];
    const targetId = comp.id || comp.code;
    const compName = comp.name || comp.code || targetId;

    let deleted = false;

    // Try deleting via URL path parameter: DELETE /api/masters/salary-components/:id
    try {
      const delUrl = `${activeUrl.replace(/\/$/, "")}/${encodeURIComponent(targetId)}`;
      const delRes = await fetch(delUrl, {
        method: "DELETE",
        headers,
      });

      if (delRes.ok) {
        console.log(`[HTTP ${delRes.status}] (${i + 1}/${componentsToDelete.length}) Deleted component: "${compName}" (Code: ${comp.code}, ID: ${targetId})`);
        successCount++;
        deleted = true;
      } else {
        // Try deleting via Query Parameter: DELETE /api/masters/salary-components?id=:id
        const queryUrl = `${activeUrl}?id=${encodeURIComponent(targetId)}`;
        const queryRes = await fetch(queryUrl, {
          method: "DELETE",
          headers,
        });

        if (queryRes.ok) {
          console.log(`[HTTP ${queryRes.status}] (${i + 1}/${componentsToDelete.length}) Deleted component via query: "${compName}" (Code: ${comp.code})`);
          successCount++;
          deleted = true;
        } else {
          // Try deleting via Request Body: DELETE /api/masters/salary-components
          const bodyRes = await fetch(activeUrl, {
            method: "DELETE",
            headers,
            body: JSON.stringify({ id: targetId, code: comp.code }),
          });

          if (bodyRes.ok) {
            console.log(`[HTTP ${bodyRes.status}] (${i + 1}/${componentsToDelete.length}) Deleted component via body: "${compName}" (Code: ${comp.code})`);
            successCount++;
            deleted = true;
          } else {
            const errText = await delRes.text().catch(() => "");
            console.log(`[HTTP ${delRes.status}] (${i + 1}/${componentsToDelete.length}) Failed to delete "${compName}": ${errText.substring(0, 100)}`);
            failCount++;
          }
        }
      }
    } catch (err) {
      console.log(`[ERROR] Exception while deleting "${compName}": ${err.message}`);
      failCount++;
    }
  }

  console.log("\n----------------------------------------");
  console.log(`Bulk Deletion Complete!`);
  console.log(`Successfully deleted: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

deleteSalaryComponents();
