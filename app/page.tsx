import "./homepage.css";
import { HomepageClient } from "@/components/homepage-client";
import { MachineCard } from "@/components/machine-card";
import { getPublicMachines, formatProductionDate } from "@/lib/supabase/machines-server";

export default async function Home() {
  const machinesFromDb = await getPublicMachines();
  
  // Transform data to match expected interface
  const machinesData = machinesFromDb.map(machine => ({
    id: parseInt(machine.id.substring(0, 8), 16), // Convert UUID to number for compatibility
    model: machine.model,
    stock: machine.stock,
    productionDate: formatProductionDate(machine.production_date),
    images: machine.image_urls,
    specifications: machine.specifications,
    toolingDrawing: machine.tooling_drawing_url || ''
  }));

  return (
    <div>
      {/* Header Banner with Auto Rotation */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-slides">
            <div className="hero-slide active">
              <div className="hero-bg slide-bg-1"></div>
              <div className="hero-text">
                <h1>HARSLE Inventory Machines</h1>
                <p>Professional Press Brake Solutions Ready For Delivery</p>
              </div>
            </div>
            <div className="hero-slide">
              <div className="hero-bg slide-bg-2"></div>
              <div className="hero-text">
                <h1>Advanced Manufacturing Excellence</h1>
                <p>Cutting-Edge Industrial Equipment for Modern Production</p>
              </div>
            </div>
            <div className="hero-slide">
              <div className="hero-bg slide-bg-3"></div>
              <div className="hero-text">
                <h1>Precision Engineering Solutions</h1>
                <p>High-Performance Bending Machines for Superior Results</p>
              </div>
            </div>
          </div>
          <div className="slide-indicators">
            <span className="indicator active" data-slide="0"></span>
            <span className="indicator" data-slide="1"></span>
            <span className="indicator" data-slide="2"></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="machines-grid" id="machinesGrid">
            {machinesData.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="company-footer">
        <div className="container">
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2025 <a href="https://www.harsle.com" target="_blank" rel="noopener noreferrer" className="footer-link">HARSLE</a>. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button id="backToTop" className="back-to-top" title="Back to Top">
        ⬆️
      </button>

      {/* Quote Modal */}
      <div id="quoteModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Request Quote</h2>
            <span className="close">&times;</span>
          </div>
          <form id="quoteForm" className="quote-form">
            <div className="quote-product-info" id="quoteProductInfo" style={{display: 'none'}}>
              <h4>Product Information</h4>
              <div id="productDisplayInfo"></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input type="text" id="fullName" name="fullName" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">WhatsApp Number *</label>
                <input type="tel" id="phone" name="phone" required placeholder="+1234567890" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input type="text" id="company" name="company" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea id="message" name="message" rows={3} required placeholder="Please describe your specific requirements..."></textarea>
            </div>
            <input type="hidden" id="productModel" name="productModel" />
            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      <div id="imageModal" className="modal image-modal">
        <div className="modal-content image-modal-content">
          <span className="close">&times;</span>
          <img id="modalImage" src={undefined} alt="" />
          <div className="image-nav">
            <button id="prevImage" className="nav-btn">‹</button>
            <button id="nextImage" className="nav-btn">›</button>
          </div>
        </div>
      </div>

      {/* Client-side functionality */}
      <HomepageClient />
    </div>
  );
}
