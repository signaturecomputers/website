'use client';

type ProductSEOProps = {
  name: string;
  brand: string;
  model: string;
  category: string;
  specs: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: string;
    warranty?: string;
    condition?: string;
  };
};

export default function ProductSEOContent({
  name,
  brand,
  model,
  category,
  specs
}: ProductSEOProps) {
  // Safe fallbacks for undefined specs
  const processor = specs.processor || 'high-performance processor';
  const ram = specs.ram || 'optimal RAM';
  const storage = specs.storage || 'fast storage';
  const display = specs.display || 'high-quality display';
  const condition = specs.condition || 'New';
  const warranty = specs.warranty || '1 Year';

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-8 prose dark:prose-invert max-w-none">
      {/* B. KEY FEATURES */}
      <div className="seo-key-features">
        <h3>Key Features</h3>
        <ul>
          <li>High performance with {processor}</li>
          <li>{ram} RAM for smooth multitasking</li>
          <li>Fast {storage} storage</li>
          <li>Suitable for office, students, and business use</li>
          <li>Warranty: {warranty}</li>
        </ul>
      </div>

      {/* D. FAQ SECTION */}
      <div className="seo-faq-section">
        <h3>Frequently Asked Questions</h3>
        <p><strong>Is this product suitable for office use?</strong><br/>
        Yes, it is ideal for daily office work, multitasking, and browsing.</p>

        <p><strong>Does this product come with warranty?</strong><br/>
        Yes, it includes {warranty} warranty.</p>

        <p><strong>Who should buy this product?</strong><br/>
        Students, professionals, and small businesses looking for reliable performance.</p>
      </div>
    </div>
  );
}
