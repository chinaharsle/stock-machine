"use client";

import { useState } from 'react';
import { formatSpecificationLabel } from '@/lib/utils';

interface MachineCardProps {
  machine: {
    id: number;
    model: string;
    stock: number;
    productionDate: string;
    images: string[];
    specifications: Record<string, string>;
    toolingDrawing?: string;
  };
  onQuoteClick?: (model: string, specifications: Record<string, string>) => void;
  onImageClick?: (images: string[], startIndex: number) => void;
}

export function MachineCard({ machine, onQuoteClick, onImageClick }: MachineCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const stockClass = machine.stock < 5 ? 'low-stock' : '';
  
  const handleImageNavigation = (direction: number) => {
    const newIndex = (currentImageIndex + direction + machine.images.length) % machine.images.length;
    setCurrentImageIndex(newIndex);
  };
  
  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(machine.images, currentImageIndex);
    } else {
      // Fallback to global function if available
      if (typeof window !== 'undefined' && 'openImageModal' in window) {
        (window as typeof window & { openImageModal: (images: string[], startIndex: number) => void }).openImageModal(machine.images, currentImageIndex);
      }
    }
  };
  
  const handleQuoteClick = () => {
    if (onQuoteClick) {
      onQuoteClick(machine.model, machine.specifications);
    } else {
      // Fallback to global function if available
      if (typeof window !== 'undefined' && 'openQuoteModal' in window) {
        (window as typeof window & { openQuoteModal: (model: string, specifications: Record<string, string>) => void }).openQuoteModal(machine.model, machine.specifications);
      }
    }
  };
  
  return (
    <div className="machine-card" data-machine-id={machine.id}>
      <div className="card-header">
        <div className="card-header-top">
          <div className="product-info">
            <h3>{machine.model}</h3>
          </div>
          <div className="title-stock-info">
            <div className="production-date">MFG Date: {machine.productionDate}</div>
            <span className={`title-stock-badge ${stockClass}`}>
              Stock: {machine.stock} Set{machine.stock !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="image-gallery">
          <div className="image-container">
            <img 
              className="machine-image" 
              src={machine.images[currentImageIndex]} 
              alt={machine.model}
              onClick={handleImageClick}
              loading="lazy"
            />
            {machine.images.length > 1 && (
              <div className="image-arrows">
                <button 
                  className="arrow-btn prev-btn" 
                  onClick={() => handleImageNavigation(-1)}
                >
                  ‹
                </button>
                <button 
                  className="arrow-btn next-btn" 
                  onClick={() => handleImageNavigation(1)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
          
          {machine.images.length > 1 && (
            <div className="image-dots">
              {machine.images.map((_, index) => (
                <span 
                  key={index}
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="product-details">
          <div className="details-top">
            {Object.entries(machine.specifications).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{formatSpecificationLabel(key)}:</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
            
            {machine.toolingDrawing && (
              <div className="detail-item tooling-row">
                <span className="detail-label">Tooling Drawing:</span>
                <a 
                  href={machine.toolingDrawing} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-btn-inline"
                >
                  📄 Preview
                </a>
              </div>
            )}
          </div>
          
          <button 
            className="quote-btn"
            onClick={handleQuoteClick}
          >
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
} 