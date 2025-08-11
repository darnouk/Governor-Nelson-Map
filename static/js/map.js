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
  
  // Function to test auto-scaling manually
  window.testAutoScale = function(scale = 0.75) {
    const splashContent = document.querySelector('.splash-content');
    if (!splashContent) {
      console.log('Splash screen not found');
      return;
    }
    
    splashContent.style.zoom = scale;
    splashContent.style.transform = `scale(${scale})`;
    const marginAdjust = (1 - scale) * 50;
    splashContent.style.marginTop = `-${marginAdjust}vh`;
    splashContent.style.marginBottom = `-${marginAdjust}vh`;
    
    console.log(`Applied ${scale * 100}% scaling to splash content`);
  };
  
  // Function to reset scaling
  window.resetScale = function() {
    const splashContent = document.querySelector('.splash-content');
    if (splashContent) {
      splashContent.style.zoom = '';
      splashContent.style.transform = '';
      splashContent.style.marginTop = '';
      splashContent.style.marginBottom = '';
      console.log('Reset splash content scaling');
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
  "esri/layers/KMLLayer",
  "esri/layers/MediaLayer",
  "esri/widgets/Home",
  "esri/widgets/Track"
], function(esriConfig, Map, MapView, FeatureLayer, KMLLayer, MediaLayer, Home, Track) {
  
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

  // Move zoom controls down to avoid overlap with layer panel
  view.ui.move("zoom", "top-left");
  
  // Adjust positioning after view loads
  view.when(function() {
    // Add custom positioning - now only need to avoid hamburger menu
    const zoomWidget = document.querySelector('.esri-zoom');
    const homeWidget = document.querySelector('.esri-home');
    const trackWidget = document.querySelector('.esri-track');
    
    if (zoomWidget) zoomWidget.style.top = '70px';    // Below hamburger menu
    if (homeWidget) homeWidget.style.top = '150px';   // Below zoom buttons
    if (trackWidget) trackWidget.style.top = '190px'; // Below home button
  });

  // Add Nature Sites Layer (hidden by default)
  const natureSitesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/GNSP_Nature_Sites/FeatureServer",
    outFields: ["*"],
    popupTemplate: {
      title: "{Location_Name}",
      content: [
        {
          type: "attachments"
        }
      ]
    },
    visible: false  // Hidden by default
  });

  // Add Elevation Layer (DEM) - KMZ format with enhanced configuration
  const elevationLayer = new KMLLayer({
    url: "https://darnouk.github.io/Governor-Nelson-Map/static/elevation/dem_35_transparency.kmz",
    title: "Elevation (DEM)",
    visible: false,  // Hidden by default
    opacity: 0.35,   // 35% transparency as indicated in filename
    // Enhanced KML loading options
    sublayers: [],
    refreshInterval: 0,
    // Try to force KML parsing
    parseFolders: true,
    // Add error handling
    loadError: function(error) {
      console.error("KML Layer failed to load:", error);
    }
  });

  // Add load event listener for debugging
  elevationLayer.when(function() {
    console.log("Elevation layer loaded successfully");
  }).catch(function(error) {
    console.error("Elevation layer load error:", error);
    
    // Fallback: Try alternative loading method
    console.log("Trying alternative elevation layer loading...");
  });

  // Placeholder layers for future implementation
  const trailsLayer = new FeatureLayer({
    url: "placeholder_trails_url",  // Replace with actual URL when available
    outFields: ["*"],
    popupTemplate: {
      title: "Trail: {name}",
      content: "{description}"
    },
    visible: false
  });

  const picnicAreasLayer = new FeatureLayer({
    url: "placeholder_picnic_url",  // Replace with actual URL when available
    outFields: ["*"],
    popupTemplate: {
      title: "Picnic Area: {name}",
      content: "{description}"
    },
    visible: false
  });

  const effigyMoundsLayer = new FeatureLayer({
    url: "placeholder_effigy_url",  // Replace with actual URL when available
    outFields: ["*"],
    popupTemplate: {
      title: "Effigy Mound: {name}",
      content: "{description}"
    },
    visible: false
  });

  const restroomsLayer = new FeatureLayer({
    url: "placeholder_restrooms_url",  // Replace with actual URL when available
    outFields: ["*"],
    popupTemplate: {
      title: "Restroom",
      content: "{description}"
    },
    visible: false
  });

  const parkingLayer = new FeatureLayer({
    url: "placeholder_parking_url",  // Replace with actual URL when available
    outFields: ["*"],
    popupTemplate: {
      title: "Parking: {name}",
      content: "{description}"
    },
    visible: false
  });

  const sheltersLayer = new FeatureLayer({
    url: "placeholder_shelters_url",  // Replace with actual URL when available
    outFields: ["*"],
    popupTemplate: {
      title: "Reservable Shelter: {name}",
      content: "{description}"
    },
    visible: false
  });

  // Add all layers to map
  map.addMany([
    elevationLayer,      // Add elevation layer first so it appears below other layers
    natureSitesLayer,
    trailsLayer,
    picnicAreasLayer,
    effigyMoundsLayer,
    restroomsLayer,
    parkingLayer,
    sheltersLayer
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
          setTimeout(() => view.resize(), 100);
        }
      }, 500);
    }
  }

  // Layer toggle functionality
  function toggleLayer(layer, toggleId) {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener('change', function() {
        layer.visible = this.checked;
      });
    }
  }

  // Set up layer toggles
  toggleLayer(elevationLayer, 'toggle-elevation');
  toggleLayer(natureSitesLayer, 'toggle-nature');
  toggleLayer(trailsLayer, 'toggle-trails');
  toggleLayer(picnicAreasLayer, 'toggle-picnic');
  toggleLayer(effigyMoundsLayer, 'toggle-effigy');
  toggleLayer(restroomsLayer, 'toggle-restrooms');
  toggleLayer(parkingLayer, 'toggle-parking');
  toggleLayer(sheltersLayer, 'toggle-shelters');

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
