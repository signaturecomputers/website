export interface CategorySEOData {
    title: string;
    description: string;
    h1: string;
    content: React.ReactNode;
}

export const CATEGORY_SEO: Record<string, CategorySEOData> = {
    'laptops': {
        title: 'Buy Premium Laptops in Chennai | Signature Computers',
        description: 'Explore the best laptops for gaming, business, and students. Signature Computers offers top brands with genuine warranty in Chennai, Tamil Nadu.',
        h1: 'Premium Laptops in Chennai',
        content: null // populated via a helper function to include JSX elements
    },
    'desktops': {
        title: 'Buy High-Performance Desktops in Chennai | Signature Computers',
        description: 'Find powerful desktop computers and all-in-ones tailored for gaming and professional use at Signature Computers, Chennai. Best prices guaranteed.',
        h1: 'High-Performance Desktops in Chennai',
        content: null
    },
    'workstations': {
        title: 'Professional Workstations in Chennai | Signature Computers',
        description: 'Shop robust professional workstations engineered for 3D rendering, CAD, and heavy computing tasks. Available now at Signature Computers, Chennai.',
        h1: 'Professional Workstations in Chennai',
        content: null
    },
    'monitors': {
        title: 'Buy Computer Monitors & Display Screens | Signature Computers',
        description: 'Discover crystal-clear computer monitors, from 4K gaming displays to ergonomic office screens. Top brands available locally in Chennai.',
        h1: 'Computer Monitors & Displays in Chennai',
        content: null
    },
    'memory-storage': {
        title: 'Buy Computer Memory & Storage Solutions in Chennai | Signature Computers',
        description: 'Discover high-speed RAM, internal SSDs, external hard drives, and enterprise memory upgrades. Genuine warranty on all memory and storage in Chennai.',
        h1: 'Computer Memory & Storage Solutions in Chennai',
        content: null
    },
    'accessories': {
        title: 'Computer & Laptop Accessories in Chennai | Signature Computers',
        description: 'Upgrade your setup with premium computer and laptop accessories in Chennai. Find mice, keyboards, cables, and more at Signature Computers.',
        h1: 'Computer & Laptop Accessories in Chennai',
        content: null
    },
    'memory': {
        title: 'Buy DDR4 & DDR5 Computer RAM Online | Signature Computers Chennai',
        description: 'Upgrade your systems with high-speed DDR4 and DDR5 RAM modules. Authentic memory upgrades for laptops and desktops with official warranty in Chennai.',
        h1: 'High-Speed Computer RAM & Memory in Chennai',
        content: null
    },
    'storage': {
        title: 'Buy Internal SSDs, HDDs & External Hard Drives | Signature Computers Chennai',
        description: 'Shop NVMe SSDs, SATA internal storage, and portable backup drives. Genuine enterprise and desktop storage solutions at Signature Computers.',
        h1: 'Computer Storage Solutions in Chennai',
        content: null
    },
    'cctv': {
        title: 'CCTV Cameras & Security Systems | Signature Computers',
        description: 'Secure your premises with high-quality CCTV cameras and surveillance systems. Available at Signature Computers, Chennai.',
        h1: 'CCTV Cameras & Security Systems in Chennai',
        content: null
    },
    'keyboards': {
        title: 'Buy Keyboards Online in Chennai | Signature Computers',
        description: 'Shop ergonomic and mechanical keyboards for typing, coding, and gaming in Chennai. Best deals at Signature Computers.',
        h1: 'Computer Keyboards in Chennai',
        content: null
    },
    'mouse': {
        title: 'Computer Mouse & Pointing Devices | Signature Computers',
        description: 'Find the perfect computer mouse, including wireless, ergonomic, and gaming models. Available locally at Signature Computers, Chennai.',
        h1: 'Computer Mouse & Pointing Devices in Chennai',
        content: null
    },
    'keyboard-mouse-combo': {
        title: 'Keyboard and Mouse Combos | Signature Computers Chennai',
        description: 'Upgrade your workstation with convenient keyboard and mouse combos. Wireless and wired options available at Signature Computers.',
        h1: 'Keyboard and Mouse Combos in Chennai',
        content: null
    },
    'headphones': {
        title: 'Headphones & Headsets in Chennai | Signature Computers',
        description: 'Experience immersive audio with our premium selection of headphones and headsets in Chennai. Ideal for gaming, music, and calls.',
        h1: 'Headphones & Headsets in Chennai',
        content: null
    },
    'cables': {
        title: 'Computer Cables & Adapters | Signature Computers Chennai',
        description: 'Shop reliable HDMI, USB, ethernet, and power cables in Chennai. Find every connector and adapter you need at Signature Computers.',
        h1: 'Computer Cables & Adapters in Chennai',
        content: null
    },
    'power-adapters': {
        title: 'Laptop Power Adapters & Chargers | Signature Computers',
        description: 'Buy genuine laptop power adapters and chargers for all top brands in Chennai. Ensure your devices stay powered up with Signature Computers.',
        h1: 'Laptop Power Adapters & Chargers in Chennai',
        content: null
    },
    'bags': {
        title: 'Laptop Bags & Sleeves in Chennai | Signature Computers',
        description: 'Protect your laptop with stylish and durable bags, backpacks, and sleeves. Wide variety available at Signature Computers, Chennai.',
        h1: 'Laptop Bags & Sleeves in Chennai',
        content: null
    },
    'docks': {
        title: 'Laptop Docking Stations in Chennai | Signature Computers',
        description: 'Expand your laptop connectivity with premium docking stations and hubs. Available for fast delivery or pickup in Chennai.',
        h1: 'Laptop Docking Stations in Chennai',
        content: null
    },
    'hubs': {
        title: 'USB Hubs & Multi-port Adapters in Chennai | Signature Computers',
        description: 'Expand your computer ports with high-speed USB hubs and multi-port adapters. Find the best computer accessories at Signature Computers, Chennai.',
        h1: 'USB Hubs & Multi-port Adapters in Chennai',
        content: null
    },
    'usb-flashdrives': {
        title: 'USB Flash Drives & Pen Drives | Signature Computers',
        description: 'Securely store and transfer your data with high-speed USB flash drives and pen drives in Chennai. Stop by Signature Computers today.',
        h1: 'USB Flash Drives & Pen Drives in Chennai',
        content: null
    },
    'dvd-writers': {
        title: 'Others - DVD Writers, Webcams & Accessories | Signature Computers',
        description: 'Buy external DVD writers, webcams, and other accessories in Chennai at Signature Computers.',
        h1: 'Others - DVD Writers, Webcams & Accessories in Chennai',
        content: null
    }
};

// Helper function to generate generic but lengthy SEO content for missing specific blocks
export function getSEOContent(slug: string, name: string): { h1: string, h2_1: string, p1: string, h2_2: string, p2: string } {
    const data = CATEGORY_SEO[slug];
    const categoryName = name || slug;
    
    return {
        h1: data?.h1 || `Buy ${categoryName} in Chennai`,
        h2_1: `Why Choose Signature Computers for ${categoryName}?`,
        p1: `When it comes to purchasing high-quality ${categoryName.toLowerCase()}, Signature Computers in Chennai stands as your trusted and authorized technology partner. We understand that finding the right hardware and accessories is crucial for your personal computing, gaming setup, or professional enterprise environment. Our extensive catalog guarantees that you receive only genuine, authentic products backed by official manufacturer warranties. Operating within Tamil Nadu, India, we take pride in offering competitive pricing without compromising on quality or after-sales support. Whether you are upgrading an existing workstation, building a new custom PC from scratch, or simply replacing essential peripherals, our dedicated staff ensures that your requirements are met with precision and unmatched technical expertise.`,
        h2_2: `Comprehensive Range of ${categoryName} and IT Solutions`,
        p2: `Our inventory of ${categoryName.toLowerCase()} is meticulously curated to cover every possible use-case, from budget-friendly options to premium flagship models. Navigating the fast-paced world of technology requires reliable equipment, which is why we strictly stock items that pass rigorous quality standards. Not only do we provide exceptional hardware, but we also ensure a seamless shopping experience with GST invoicing for businesses and dedicated warranty assistance. By sourcing our ${categoryName.toLowerCase()} directly from authorized distributors, we eliminate counterfeit risks, ensuring longevity and optimal performance. For customers in Chennai and throughout India, our streamlined delivery systems and physical storefront access mean you can confidently secure the technology you need, precisely when you need it.`
    };
}
