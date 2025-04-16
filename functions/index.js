export async function checkInternetIssue(phone_number) {
  if (phone_number === '6285769000007') {
    return {
      status: 'down',
      reason: 'unpaid_invoice',
      invoice_amount: 165000,
      invoice_id: 'INV-20250413-XYZ',
      payment_link: 'https://xendit.com/ontimepaymentlink',
    };
  } else {
    return {
      status: 'down',
      reason: 'mass_outage',
      area: 'Sumbersari, Jember',
      estimated_fix_time: '2025-04-14T15:00:00',
    };
  }
}
export async function getMonthlyPromo() {
  // Dummy promo aktif bulan ini
  return {
    title: 'PROMO HEMAT APRIL',
    description: 'Diskon 20% untuk pembayaran paket 3 bulan di muka!',
    valid_until: '30 April 2025',
    claim_link: 'https://aminetpromo.com/claim-april2025',
  };
}
