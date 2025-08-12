// Mobile viewport and safe area handling
(function() {
  'use strict';
  
  // Function to update CSS custom property for app height
  function updateAppHeight() {
    // Get the viewport height and update the CSS custom property
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update app height custom property
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  }
  
  // Function to simulate safe areas for desktop testing
  window.simulateSafeAreas = function(enabled = true) {
    const body = document.body;
    if (enabled) {
      body.classList.add('simulate-safe-areas');
      console.log('Safe area simulation enabled - you can see how the app looks on notched devices');
    } else {
      body.classList.remove('simulate-safe-areas');
      console.log('Safe area simulation disabled');
    }
  };
  
  // Function to auto-scale splash content for optimal fit (replicates 75% zoom effect)
  function autoScaleSplashContent() {
    const splashContent = document.querySelector('.splash-content');
    if (!splashContent) return;
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate optimal scale based on viewport dimensions
    let scale = 1;
    
    // Mobile portrait optimization
    if (viewportWidth <= 414 && viewportHeight >= 700) {
      scale = 0.75; // Replicate your 75% zoom finding
    }
    // Small mobile screens
    else if (viewportWidth <= 375 && viewportHeight <= 700) {
      scale = 0.7;
    }
    // Mobile landscape
    else if (viewportHeight <= 500 && viewportWidth > viewportHeight) {
      scale = 0.65;
    }
    // Tablet portrait
    else if (viewportWidth <= 768 && viewportHeight <= 1024) {
      scale = 0.8;
    }
    
    // Apply scaling if needed
    if (scale < 1) {
      splashContent.style.transform = `scale(${scale})`;
      // Adjust margins to account for scaling
      const marginAdjust = (1 - scale) * 50; // Percentage of viewport
      splashContent.style.marginTop = `-${marginAdjust}vh`;
      splashContent.style.marginBottom = `-${marginAdjust}vh`;
      
      console.log(`Auto-scaled splash content to ${scale * 100}% for optimal fit`);
    } else {
      // Reset scaling for larger screens
      splashContent.style.transform = '';
      splashContent.style.marginTop = '';
      splashContent.style.marginBottom = '';
    }
  }
  
  // Function to detect if device has safe areas
  function detectSafeAreas() {
    const supportsEnv = CSS.supports('padding-top: env(safe-area-inset-top)');
    const hasNotch = window.navigator.userAgent.includes('iPhone') && 
                     window.screen.height >= 812; // iPhone X and newer
    
    return supportsEnv || hasNotch;
  }
  
  // Initialize viewport handling
  function initViewport() {
    updateAppHeight();
    autoScaleSplashContent(); // Apply optimal scaling
    
    // Add visual viewport API support if available (newer browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function() {
        updateAppHeight();
        autoScaleSplashContent();
      });
    }
    
    // Fallback for older browsers
    window.addEventListener('resize', function() {
      updateAppHeight();
      autoScaleSplashContent();
    });
    window.addEventListener('orientationchange', function() {
      // Small delay to ensure orientation change is complete
      setTimeout(function() {
        updateAppHeight();
        autoScaleSplashContent();
      }, 100);
    });
    
    // Log safe area support
    if (detectSafeAreas()) {
      console.log('Safe area support detected');
    } else {
      console.log('No safe area support - use simulateSafeAreas() to test');
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewport);
  } else {
    initViewport();
  }
})();

require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Home",
  "esri/widgets/Track",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Expand",
  "esri/Basemap"
], function(esriConfig, Map, MapView, FeatureLayer, Home, Track, BasemapGallery, Expand, Basemap) {
  
  esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurEDq81m6iLS4nyHtFHczj5TBqBx8Cg1drp7txdNmq8KNcgADNXtClYAyolWAWKETPy2ha0mHQ6nbWbf9JbmcHyJ8jqc1m2fdnvqmR_A-K00HUdmE8WqyGDzMzgyPnJ-y08FMI8E_30r1zNQeqI0JTqlAaMCqbPJyzoB_Klx1-f3txjHTucNYnuNcd7MINMB0tkiUm4rncl0pI2eDyrhZq55YNY986lm2BMLPbfFHn_V8OVlySdJdwc3vp7ei1NcrqA..AT1_Iy6Coz2P";

  const map = new Map({
    basemap: "arcgis-topographic"
  });

  const view = new MapView({
    container: "mapView",
    map: map,
    center: [-89.4374, 43.1339], // 43°08'02.0"N 89°26'14.8"W
    zoom: 15,
    constraints: {
      minZoom: 12  // Prevents zooming out too far from the park
    }
  });
view.padding = {
    top: 40, // Space for splash screen and controls
  };
  view.ui.add(new Home({ view }), "top-left");
  view.ui.add(new Track({ view }), "top-left");

  // Create basemap gallery with only the 4 specified basemaps
  const basemapGallery = new BasemapGallery({
    view: view,
    source: [
      Basemap.fromId("arcgis-topographic"),    // Default current one
      Basemap.fromId("osm"),                   // OpenStreetMap
      Basemap.fromId("satellite"),             // Satellite imagery
      Basemap.fromId("hybrid")                 // Satellite hybrid
    ]
  });
  
  // Create expandable widget for basemap gallery
  const basemapExpand = new Expand({
    view: view,
    content: basemapGallery,
    expandIconClass: "esri-icon-basemap",
    expandTooltip: "Change Basemap"
  });
  
  // Add expandable basemap gallery to UI
  view.ui.add(basemapExpand, "top-right");

  // Move zoom controls down to avoid overlap with layer panel
  view.ui.move("zoom", "top-left");
  
  // Adjust positioning after view loads
  view.when(function() {
    // Add custom positioning - now only need to avoid hamburger menu
    const zoomWidget = document.querySelector('.esri-zoom');
    const homeWidget = document.querySelector('.esri-home');
    const trackWidget = document.querySelector('.esri-track');
    
    if (zoomWidget) {
      zoomWidget.style.top = '150px !important';   // Force much lower positioning
      zoomWidget.style.position = 'absolute !important';
    }
    if (homeWidget) {
      homeWidget.style.top = '230px !important';   // Force much lower positioning
      homeWidget.style.position = 'absolute !important';
    }
    if (trackWidget) {
      trackWidget.style.top = '270px !important';  // Force much lower positioning
      trackWidget.style.position = 'absolute !important';
    }
  });

  // Add Nature Sites Layer with professional tree SVG (hidden by default)
  const natureSitesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/GNSP_Nature_Sites/FeatureServer",
    outFields: ["*"],
    popupTemplate: {
      title: "� {Location_Name}",
      content: [
        {
          type: "attachments"
        }
      ]
    },
    visible: false,  // Hidden by default
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Tree trunk -->
            <path d="M12 22V18" stroke="#8B4513" stroke-width="3"/>
            <!-- Tree foliage layers -->
            <path d="M7 14C7 11.239 9.239 9 12 9S17 11.239 17 14C17 16.761 14.761 19 12 19S7 16.761 7 14Z" fill="#228B22" stroke="#006400"/>
            <path d="M8 11C8 8.791 9.791 7 12 7S16 8.791 16 11C16 13.209 14.209 15 12 15S8 13.209 8 11Z" fill="#32CD32" stroke="#228B22"/>
            <path d="M9 8C9 6.343 10.343 5 12 5S15 6.343 15 8C15 9.657 13.657 11 12 11S9 9.657 9 8Z" fill="#90EE90" stroke="#32CD32"/>
          </svg>
        `),
        width: "26px",
        height: "26px"
      }
    }
  });

  // Add User-Submitted Nature Sites Layer (Survey123 Results) with same tree SVG (hidden by default)
  const userNatureSitesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/survey123_ec0397e420924f45be48ae4dceda07cf_results/FeatureServer/0?token=3NKHt6i2urmWtqOuugvr9YhvtvGfkqCTb6HtscO0U3nOfzbuJxqcU-G8jI2MWfZGWX7oXCBso1LiN7LTrMpdGGRaqaSAibVqXcsOJi45bccBoEKW-FlGePFudqp2Ic3uYafg_ltc6hAKt283lK4oy6347Z_qCPDK1f2sQhFhB_K0MWJKoSodLK2w3VTj9PIyrUiBzBVo76chYkYEmQ_JAf7-Q4tOIqtNLkQItkNKPXPsixlNPdJ_V_UyKQObEJ7Qj0sOMvlaTOzIKAxKJ9DnTw..",
    outFields: ["*"],
    popupTemplate: {
      title: "🌱 User-Submitted Nature Site",
      content: [
        {
          type: "attachments"
        }
      ]
    },
    visible: false,  // Hidden by default, controlled by Nature Sites toggle
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Tree trunk -->
            <path d="M12 22V18" stroke="#8B4513" stroke-width="3"/>
            <!-- Tree foliage layers -->
            <path d="M7 14C7 11.239 9.239 9 12 9S17 11.239 17 14C17 16.761 14.761 19 12 19S7 16.761 7 14Z" fill="#228B22" stroke="#006400"/>
            <path d="M8 11C8 8.791 9.791 7 12 7S16 8.791 16 11C16 13.209 14.209 15 12 15S8 13.209 8 11Z" fill="#32CD32" stroke="#228B22"/>
            <path d="M9 8C9 6.343 10.343 5 12 5S15 6.343 15 8C15 9.657 13.657 11 12 11S9 9.657 9 8Z" fill="#90EE90" stroke="#32CD32"/>
          </svg>
        `),
        width: "26px",
        height: "26px"
      }
    }
  });

  // Paved Bike Trail with emoji styling
  const pavedBikeTrail = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Paved_Bike_Trail/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🚴 Paved Bike Trail",
      content: "{description}"
    },
    visible: false,
    // Custom line styling for bike trail
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: [34, 139, 34, 0.8], // Forest green
        width: "4px",
        style: "solid"
      }
    }
  });

  // Redtail Hawk Trail
  const redtailHawkTrail = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Redtail_Hawk_Trail/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🦅 Redtail Hawk Trail",
      content: "{description}"
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: [139, 69, 19, 0.8], // Brown color for hiking trail
        width: "3px",
        style: "dash"
      }
    }
  });

  // Oak Savanna Trail
  const oakSavannaTrail = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Oak_Savanna_Trail/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🌳 Oak Savanna Trail",
      content: "{description}"
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: [46, 125, 50, 0.8], // Dark green for savanna
        width: "3px",
        style: "solid"
      }
    }
  });

  // Morningside Trail
  const morningsideTrail = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Morningside_Trail/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🌅 Morningside Trail",
      content: "{description}"
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: [255, 152, 0, 0.8], // Orange for sunrise/morning
        width: "3px",
        style: "dot"
      }
    }
  });

  // Woodland Trail
  const woodlandTrail = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Woodland_Trail/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🌲 Woodland Trail",
      content: "{description}"
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-line",
        color: [27, 94, 32, 0.8], // Deep forest green
        width: "4px",
        style: "solid"
      }
    }
  });

  // Group trails together for the toggle
  const trailsLayer = [pavedBikeTrail, redtailHawkTrail, oakSavannaTrail, morningsideTrail, woodlandTrail];

  const picnicAreasLayer = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/picnic_area/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🧺 Picnic Area",
      content: [
        {
          type: "text",
          text: "{description}"
        }
      ]
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Picnic table top -->
            <rect x="4" y="11" width="16" height="2" fill="#8B4513" stroke="#654321" rx="1"/>
            <!-- Table legs -->
            <line x1="6" y1="13" x2="6" y2="20" stroke="#654321" stroke-width="2"/>
            <line x1="18" y1="13" x2="18" y2="20" stroke="#654321" stroke-width="2"/>
            <!-- Bench seats -->
            <rect x="4" y="8" width="16" height="1.5" fill="#8B4513" stroke="#654321" rx="0.5"/>
            <rect x="4" y="14.5" width="16" height="1.5" fill="#8B4513" stroke="#654321" rx="0.5"/>
            <!-- Bench legs -->
            <line x1="7" y1="9.5" x2="7" y2="12" stroke="#654321" stroke-width="1.5"/>
            <line x1="17" y1="9.5" x2="17" y2="12" stroke="#654321" stroke-width="1.5"/>
            <line x1="7" y1="16" x2="7" y2="18.5" stroke="#654321" stroke-width="1.5"/>
            <line x1="17" y1="16" x2="17" y2="18.5" stroke="#654321" stroke-width="1.5"/>
            <!-- Picnic basket on table -->
            <ellipse cx="12" cy="10" rx="2" ry="1" fill="#D2691E" stroke="#8B4513"/>
          </svg>
        `),
        width: "26px",
        height: "26px"
      }
    }
  });

  // Conical Mound - archaeological feature with hill SVG
  const conicalMound = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Conical_Mound/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "⛰️ Conical Mound",
      content: [
        {
          type: "text",
          text: "{description}"
        }
      ]
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Hill/mound shape -->
            <path d="M3 20L8 14L12 16L16 10L21 14V20H3Z" fill="#8B4513" stroke="#654321" stroke-width="1.5"/>
            <!-- Grass/vegetation on top -->
            <path d="M6 14L7 12L8 14" stroke="#228B22" stroke-width="1.5" fill="none"/>
            <path d="M10 15L11 13L12 15" stroke="#228B22" stroke-width="1.5" fill="none"/>
            <path d="M14 12L15 10L16 12" stroke="#228B22" stroke-width="1.5" fill="none"/>
            <path d="M17 14L18 12L19 14" stroke="#228B22" stroke-width="1.5" fill="none"/>
          </svg>
        `),
        width: "24px",
        height: "24px"
      }
    }
  });

  // Panther Mound - archaeological feature with panther SVG
  const pantherMound = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/Panther_Mound2/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🐾 Panther Mound",
      content: [
        {
          type: "text",
          text: "{description}"
        }
      ]
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <!-- Panther body -->
            <ellipse cx="12" cy="14" rx="8" ry="3" fill="#2C1810" stroke="#1A0F08"/>
            <!-- Panther head -->
            <circle cx="18" cy="12" r="3.5" fill="#2C1810" stroke="#1A0F08"/>
            <!-- Ears -->
            <path d="M16.5 9.5L17 8.5L18 9" fill="#2C1810" stroke="#1A0F08"/>
            <path d="M19 9L20 8.5L19.5 9.5" fill="#2C1810" stroke="#1A0F08"/>
            <!-- Eyes -->
            <circle cx="17" cy="11.5" r="0.8" fill="#FFD700"/>
            <circle cx="19" cy="11.5" r="0.8" fill="#FFD700"/>
            <!-- Tail -->
            <path d="M4 15C3 14 3 13 4 12C5 11 6 12 6 13" fill="none" stroke="#2C1810" stroke-width="2"/>
            <!-- Legs -->
            <line x1="8" y1="16" x2="8" y2="18" stroke="#2C1810" stroke-width="2"/>
            <line x1="11" y1="16" x2="11" y2="18" stroke="#2C1810" stroke-width="2"/>
            <line x1="15" y1="16" x2="15" y2="18" stroke="#2C1810" stroke-width="2"/>
            <line x1="18" y1="16" x2="18" y2="18" stroke="#2C1810" stroke-width="2"/>
          </svg>
        `),
        width: "26px",
        height: "26px"
      }
    }
  });

  // Group effigy mounds together
  const effigyMoundsLayer = [conicalMound, pantherMound];

  const restroomsLayer = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/Restrooms/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🚻 Restroom",
      content: "{description}"
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Building outline -->
            <rect x="3" y="5" width="18" height="16" fill="#4A90E2" stroke="#2C5282" rx="2"/>
            <!-- Door -->
            <rect x="10" y="14" width="4" height="7" fill="#2C5282"/>
            <!-- Door handle -->
            <circle cx="12.5" cy="17.5" r="0.5" fill="#E2E8F0"/>
            <!-- Male figure -->
            <circle cx="8" cy="9" r="1.5" fill="white"/>
            <line x1="8" y1="10.5" x2="8" y2="16" stroke="white" stroke-width="1.5"/>
            <line x1="8" y1="12" x2="6.5" y2="14" stroke="white" stroke-width="1.5"/>
            <line x1="8" y1="12" x2="9.5" y2="14" stroke="white" stroke-width="1.5"/>
            <line x1="8" y1="16" x2="6.5" y2="18" stroke="white" stroke-width="1.5"/>
            <line x1="8" y1="16" x2="9.5" y2="18" stroke="white" stroke-width="1.5"/>
            <!-- Female figure -->
            <circle cx="16" cy="9" r="1.5" fill="white"/>
            <polygon points="16,10.5 14.5,16 17.5,16" fill="white"/>
            <line x1="16" y1="12" x2="14.5" y2="14" stroke="white" stroke-width="1.5"/>
            <line x1="16" y1="12" x2="17.5" y2="14" stroke="white" stroke-width="1.5"/>
            <line x1="16" y1="16" x2="14.5" y2="18" stroke="white" stroke-width="1.5"/>
            <line x1="16" y1="16" x2="17.5" y2="18" stroke="white" stroke-width="1.5"/>
          </svg>
        `),
        width: "24px",
        height: "24px"
      }
    }
  });

  const parkingLayer = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/ArcGIS/rest/services/parking_lotsaaaaaa/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: {
      title: "🚗 Parking Area",
      content: "{description}"
    },
    visible: false,
    renderer: {
      type: "simple",
      symbol: {
        type: "picture-marker",
        url: "data:image/svg+xml;base64," + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Car body -->
            <path d="M5 17h14v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2z" fill="#607D8B" stroke="#37474F"/>
            <path d="M7 14h10l1 3H6l1-3z" fill="#607D8B" stroke="#37474F"/>
            <!-- Car windshield and windows -->
            <path d="M8 14l1-4h6l1 4" fill="#B0BEC5" stroke="#37474F"/>
            <!-- Wheels -->
            <circle cx="8" cy="17" r="2" fill="#424242" stroke="#212121"/>
            <circle cx="16" cy="17" r="2" fill="#424242" stroke="#212121"/>
            <!-- Wheel centers -->
            <circle cx="8" cy="17" r="0.8" fill="#757575"/>
            <circle cx="16" cy="17" r="0.8" fill="#757575"/>
            <!-- Headlights -->
            <circle cx="6.5" cy="15" r="0.8" fill="#FFF9C4" stroke="#F57F17"/>
            <circle cx="17.5" cy="15" r="0.8" fill="#FFF9C4" stroke="#F57F17"/>
            <!-- P for Parking -->
            <text x="12" y="12" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="4" font-weight="bold">P</text>
          </svg>
        `),
        width: "26px",
        height: "26px"
      }
    }
  });

  // Add all layers to map
  map.addMany([
    natureSitesLayer,
    userNatureSitesLayer,
    pavedBikeTrail,
    redtailHawkTrail,
    oakSavannaTrail,
    morningsideTrail,
    woodlandTrail,
    picnicAreasLayer,
    conicalMound,
    pantherMound,
    restroomsLayer,
    parkingLayer
  ]);

  // Function to hide splash screen
  function hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
      splashScreen.classList.add('fade-out');
      setTimeout(function() {
        splashScreen.remove();
        document.body.classList.remove('splash-active');
        document.body.classList.add('map-active');
        // Refresh map size after transition
        if (view) {
          view.container.style.height = '100vh';
          // Use view.when() to ensure proper refresh
          setTimeout(() => {
            if (view.ready) {
              view.goTo(view.center);  // Force refresh instead of resize()
            }
          }, 100);
        }
      }, 500);
    }
  }

  // Layer toggle functionality - handles both single layers and arrays of layers
  function toggleLayer(layer, toggleId) {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener('change', function() {
        // Check if layer is an array (multiple layers) or single layer
        if (Array.isArray(layer)) {
          // Toggle all layers in the array
          layer.forEach(l => {
            l.visible = this.checked;
          });
        } else {
          // Toggle single layer
          layer.visible = this.checked;
        }
      });
    }
  }

  // Set up layer toggles
  toggleLayer([natureSitesLayer, userNatureSitesLayer], 'toggle-nature'); // Both original and user-submitted nature sites
  toggleLayer(trailsLayer, 'toggle-trails'); // trailsLayer is an array of trail layers
  toggleLayer(picnicAreasLayer, 'toggle-picnic');
  toggleLayer(effigyMoundsLayer, 'toggle-effigy');
  toggleLayer(restroomsLayer, 'toggle-restrooms');
  toggleLayer(parkingLayer, 'toggle-parking');

  // Add event listeners for splash screen controls
  document.getElementById('startExploring').addEventListener('click', hideSplashScreen);

  // Panel toggle functionality
  document.getElementById('togglePanel').addEventListener('click', function() {
    const panelContent = document.getElementById('panelContent');
    panelContent.classList.toggle('active');
  });

  // Hamburger menu functionality
  document.getElementById('menuToggle').addEventListener('click', function() {
    const menuContent = document.getElementById('menuContent');
    menuContent.classList.toggle('active');
  });

  // Survey123 form link
  document.getElementById('suggestLocation').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('https://arcg.is/1mC0WX3', '_blank');
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('hamburgerMenu');
    const menuContent = document.getElementById('menuContent');
    
    if (!menu.contains(e.target)) {
      menuContent.classList.remove('active');
    }
  });

  // Optional: Auto-hide splash screen after map loads (but give user time to read)
  view.when(function() {
    natureSitesLayer.when(function() {
      // Map is loaded, but user controls when to dismiss splash
      console.log("Map and layers loaded - splash screen ready for user interaction");
    }).catch(function(error) {
      console.warn("Layer loading error:", error);
    });
  }).catch(function(error) {
    console.warn("Map view loading error:", error);
  });
  
  // Initialize splash screen state
  document.body.classList.add('splash-active');
});
