
const content = `1. Delivery Areas

Currently, delivery of products purchased from https://signaturecomputers.vercel.app/ is available only in the following locations:

• Tamil Nadu
• Andhra Pradesh
• Telangana
• Karnataka
• Kerala
• Puducherry

Any updates regarding the inclusion or removal of delivery locations will be updated on this page. Customers are advised to review the Shipping & Delivery Policy regularly for the latest information.

2. Delivery Timelines

Signature Computers shall take all reasonable efforts to deliver products within the following timelines, calculated from the date of order confirmation, subject to:

• Successful payment confirmation
• Product availability

Estimated delivery timelines:

• Chennai: Within 2 working days
• Other serviceable areas: Within 4 working days

Delivery timelines are indicative and may vary depending on logistics conditions.

3. Delay Disclaimer

Customers acknowledge and agree that Signature Computers shall not be held responsible for delays in delivery caused by circumstances beyond our control, including but not limited to:

• Natural calamities
• Transportation disruptions
• Courier partner delays
• Government restrictions

However, we will take all reasonable steps to ensure timely delivery as per the stated timelines.

4. Multiple Products & Shipping Address

If multiple products are purchased in a single order, all items will be shipped to one shipping address provided during checkout.

To ship products to different addresses, customers must place separate orders for each address.

5. Serviceability & Pincode Verification

Customers can check delivery availability for their location using the “Check Availability” option on the product page.

The shipping pincode will be verified before order payment.

If a pincode is not serviceable by our delivery partners, customers may be requested to provide an alternate serviceable address.

Orders cannot be processed for non-serviceable locations.

6. Order Processing & Dispatch

Once an order is confirmed:

• Products undergo quality inspection to ensure they are in proper condition.
• Items are securely packed.
• Orders are handed over to our trusted delivery partners for dispatch.

7. Delivery Attempts

Delivery may be completed by handing over the package to any responsible person present at the provided shipping address.

Our delivery partners will attempt delivery up to three (3) times.

If the customer is unavailable or refuses delivery during these attempts, Signature Computers reserves the right to cancel the order at its discretion.

8. Invoice & Order Confirmation

A physical invoice will be included inside the package.

An order confirmation email will be sent at the time of purchase.

A soft copy of the invoice will be emailed within the next working day after successful delivery.

9. Order Tracking

Once the order is dispatched, customers will receive an email and/or SMS containing:

• Courier partner details
• Tracking number

Tracking information may become active within 24 hours after dispatch.

Customers can track their shipment using the provided tracking details.

10. Damaged or Incorrect Product Delivery

If a product delivered:

• Does not match the original order, or
• Is received in a damaged condition

Customers must contact Signature Computers immediately with supporting proof (photos/videos).
After verification, the product will be replaced at no additional cost, subject to approval.

11. Contact Information

For any shipping or delivery-related queries, customers may contact us at:

Email: [saravanan@signaturecomputers.in]
Phone: [98842 85858]`;

async function seed() {
    try {
        const response = await fetch('http://localhost:3000/api/legal-pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'shipping-policy',
                title: 'Shipping & Delivery Policy',
                content
            })
        });
        const data = await response.json();
        console.log('Seed result:', data);
    } catch (e) {
        console.error('Seed error:', e);
    }
}

seed();
