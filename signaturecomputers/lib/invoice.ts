/**
 * Invoice Generation Service for Signature Computers
 * Matches the company's existing billing format with GST compliance
 */

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    mobile: string;
    email: string;
    website: string;
    gstin: string;
    pan: string;
    stateCode: string;
}

export interface CustomerInfo {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email?: string;
    gstin?: string;
    stateCode?: string;
}

export interface InvoiceItem {
    sno: number;
    productId?: string;
    description: string;
    warranty?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: Date;
    orderId: string;
    orderDate: Date;
    paymentMode: 'UPI' | 'Card' | 'Net Banking' | 'Online Payment';
    billedTo: CustomerInfo;
    items: InvoiceItem[];
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate?: number;
    igstAmount?: number;
    grandTotal: number;
    amountInWords: string;
}

// Company Details (Signature Computers)
export const COMPANY_INFO: CompanyInfo = {
    name: "SIGNATURE COMPUTERS",
    address: "No - 52, Ground Floor, Sri Kalyan Square, Pantheon Road, Egmore, Chennai - 600 008.",
    phone: "044 3551 0050 | 9884285858",
    mobile: "9884285858",
    email: "saravanan@signaturecomputers.in",
    website: "https://signaturecomputers.in",
    gstin: "33AEQFS0223K1ZZ",
    pan: "AEQFS0223K",
    stateCode: "33"
};

// GST State Codes for India
export const STATE_CODES: Record<string, string> = {
    "Andaman and Nicobar Islands": "35",
    "Andhra Pradesh": "37",
    "Arunachal Pradesh": "12",
    "Assam": "18",
    "Bihar": "10",
    "Chandigarh": "04",
    "Chhattisgarh": "22",
    "Dadra and Nagar Haveli and Daman and Diu": "26",
    "Delhi": "07",
    "Goa": "30",
    "Gujarat": "24",
    "Haryana": "06",
    "Himachal Pradesh": "02",
    "Jammu and Kashmir": "01",
    "Jharkhand": "20",
    "Karnataka": "29",
    "Kerala": "32",
    "Ladakh": "38",
    "Lakshadweep": "31",
    "Madhya Pradesh": "23",
    "Maharashtra": "27",
    "Manipur": "14",
    "Meghalaya": "17",
    "Mizoram": "15",
    "Nagaland": "13",
    "Odisha": "21",
    "Puducherry": "34",
    "Punjab": "03",
    "Rajasthan": "08",
    "Sikkim": "11",
    "Tamil Nadu": "33",
    "Telangana": "36",
    "Tripura": "16",
    "Uttar Pradesh": "09",
    "Uttarakhand": "05",
    "West Bengal": "19"
};

// Common HSN Codes for Computer Products
export const HSN_CODES: Record<string, string> = {
    laptops: "8471300",
    desktops: "8471300",
    workstations: "8471300",
    monitors: "8528520",
    memory: "8473302",
    storage: "8471702",
    keyboards: "8471607",
    mouse: "8471607",
    "keyboard-mouse-combo": "8471607",
    headphones: "8518300",
    cables: "8544429",
    "power-adapters": "8504409",
    bags: "4202129",
    docks: "8471800",
    "usb-flashdrives": "8523510",
    "dvd-writers": "8471700",
    cctv: "8525801",
    default: "8471300"
};

/**
 * Get the state code from state name
 */
export function getStateCode(stateName: string): string {
    const normalized = stateName.trim();
    return STATE_CODES[normalized] || "";
}

/**
 * Determine if transaction is intra-state or inter-state
 */
export function isIntraState(customerState: string): boolean {
    const customerStateCode = getStateCode(customerState);
    return customerStateCode === COMPANY_INFO.stateCode;
}

/**
 * Calculate GST based on state
 * For intra-state: CGST + SGST (each 9%)
 * For inter-state: IGST (18%)
 */
export function calculateGST(amount: number, customerState: string): {
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate: number;
    igstAmount: number;
    totalTax: number;
} {
    const intraState = isIntraState(customerState);
    const gstRate = 18; // 18% GST for electronics

    if (intraState) {
        // CGST + SGST (9% each)
        const cgstRate = 9;
        const sgstRate = 9;
        const cgstAmount = Math.round((amount * cgstRate / 100) * 100) / 100;
        const sgstAmount = Math.round((amount * sgstRate / 100) * 100) / 100;

        return {
            taxableAmount: amount,
            cgstRate,
            cgstAmount,
            sgstRate,
            sgstAmount,
            igstRate: 0,
            igstAmount: 0,
            totalTax: cgstAmount + sgstAmount
        };
    } else {
        // IGST (18%)
        const igstAmount = Math.round((amount * gstRate / 100) * 100) / 100;

        return {
            taxableAmount: amount,
            cgstRate: 0,
            cgstAmount: 0,
            sgstRate: 0,
            sgstAmount: 0,
            igstRate: gstRate,
            igstAmount,
            totalTax: igstAmount
        };
    }
}

/**
 * Get HSN code for a product category
 */
export function getHSNCode(category: string): string {
    return HSN_CODES[category.toLowerCase()] || HSN_CODES.default;
}

/**
 * Generate invoice number in format: SC/YY-YY/XXXX
 * Example: SC/25-26/1628
 */
export function generateInvoiceNumber(sequenceNumber: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Financial year runs from April to March
    let fyStart: number;
    let fyEnd: number;

    if (month >= 4) {
        fyStart = year % 100;
        fyEnd = (year + 1) % 100;
    } else {
        fyStart = (year - 1) % 100;
        fyEnd = year % 100;
    }

    const paddedSequence = sequenceNumber.toString().padStart(4, '0');
    return `SC/${fyStart}-${fyEnd}/${paddedSequence}`;
}

/**
 * Convert number to words (Indian format)
 */
export function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertLessThanThousand(n: number): string {
        if (n === 0) return '';

        if (n < 20) {
            return ones[n];
        }

        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        }

        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }

    if (num === 0) return 'Zero';

    // Handle decimals (paise)
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = '';

    // Indian number system: Crore, Lakh, Thousand, Hundred
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const remainder = rupees % 1000;

    if (crore > 0) {
        result += convertLessThanThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
        result += convertLessThanThousand(remainder);
    }

    result = 'Rupees INR ' + result.trim();

    if (paise > 0) {
        result += ' and ' + convertLessThanThousand(paise) + ' Paise';
    }

    result += ' Only';

    return result;
}

/**
 * Format date for invoice display
 */
export function formatInvoiceDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
}

/**
 * Calculate taxable amount (reverse GST calculation)
 * Given final price including GST, calculate base price
 */
export function calculateTaxableFromGross(grossAmount: number, gstRate: number = 18): number {
    return Math.round((grossAmount / (1 + gstRate / 100)) * 100) / 100;
}
