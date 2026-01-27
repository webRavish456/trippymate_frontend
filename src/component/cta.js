"use client";

import { useRouter } from "next/navigation";

export default function Adventure() {
  const router = useRouter();

  const handleStartPlanning = () => {
    router.push('/packages');
  };

  return (
    <div>
      <section className="cta-section">
        {/* Background Images */}
        <div className="cta-bg-icon cta-bg-icon-left" >
          <img 
            src="/icon/map.png" 
            alt="Map icon" 
            className="cta-bg-image"
          />
        </div>
        
        <div className="cta-bg-icon cta-bg-icon-right" >
          <img 
            src="/icon/paper.png" 
            alt="Paper airplane icon" 
            className="cta-bg-image"
          />
        </div>
        
        {/* Main Content */}
        <div className="cta-content">
          <h2 className="cta-heading">Ready for Your Next Adventure?</h2>
          <p className="cta-description">
            Join thousands of travelers who trust TrippyMates for unforgettable journeys
          </p>
          <button 
            className="home-btn cta-button"
            onClick={handleStartPlanning}
            type="button"
          >
            Start Planning Now
          </button>
        </div>
      </section>
    </div>
  )
}