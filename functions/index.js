
import * as axios from "axios";
// import axios from 'axios';
const base_api = "https://aminesapps.com/api/wagateway/";
// const base_api = "http://localhost:8888/adhafera/api/Wagateway/";

const requestAPI = async (url, whatsapp) => {
  const req = await fetch(`${url}?whatsapp=${whatsapp}`)
  const json = await req.json();
  return json;
};

export async function checkInternetIssue(phone_number) {
  const reqAPI = await requestAPI(`${base_api}gamas`, phone_number)  
  if (reqAPI?.code == 'OK' && reqAPI?.data?.type != undefined) {
    const datas = reqAPI?.data
    if (datas?.type == 'unpaid_invoice') {
      return {
        status: 'down',
        reason: 'unpaid_invoice',
        invoice_amount: datas?.payment?.data?.total_invoice,
        payment_link: datas?.payment?.data?.invoice_url,
        invoice_id: [...datas?.invoiceCode].join(','),
      };
    }else if (datas?.type == 'isolated') {
      return {
        status: 'down',
        reason: 'isolated',
        description: datas?.description,
      };
    } else {
      return {
        status: 'down',
        reason: 'mass_outage',
        description: datas?.short_description,
        estimated_fix_time: `${datas?.end_time}`.replace(' ','T'),
      };
      
    }
  } else {
    return {
      status: 'down',
      reason: 'unknown_issue',
    };
  }
}
export async function getMonthlyPromo(phone_number) {
  // Dummy promo aktif bulan ini
  const reqAPI = await requestAPI(`${base_api}promo`, phone_number)  
  if (reqAPI?.code == 'OK', reqAPI?.promo?.length > 0) {
    const promo = reqAPI?.promo[0]
    return {
      status: "active",    
      title: promo?.title,
      description: promo?.description,
      valid_until: promo?.end_date,
    };
    
  }
  return {
    status: "no_promo",  
    title: 'Belum ada promo',
  };
}
