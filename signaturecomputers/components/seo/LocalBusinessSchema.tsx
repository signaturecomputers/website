import Script from 'next/script';

export default function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Signature Computers",
        "description": "Authorized HP Partner, providing premium laptops, desktops, accessories, and expert IT repair services in Chennai.",
        "url": process.env.NEXT_PUBLIC_BASE_URL || "https://signaturecomputers.in",
        "telephone": "+919884285858",
        "email": "sales@signaturecomputers.com",
        "image": [
            (process.env.NEXT_PUBLIC_BASE_URL || "https://signaturecomputers.in") + "/og-image.png"
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Ground Floor, Sri Kalyan Square, 83/52 Pantheon Rd, Egmore",
            "addressLocality": "Chennai",
            "addressRegion": "Tamil Nadu",
            "postalCode": "600008",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "13.0709244",
            "longitude": "80.2586496"
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ],
                "opens": "10:00",
                "closes": "20:00"
            }
        ],
        "priceRange": "₹₹",
        "sameAs": [
            "https://www.facebook.com/profile.php?id=100089983478161",
            "https://www.instagram.com/signaturecomputers2/"
        ]
    };

    return (
        <Script
            id="local-business-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
