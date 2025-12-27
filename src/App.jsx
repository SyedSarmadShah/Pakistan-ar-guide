import React, { useState, useRef, useEffect } from 'react';
import { Camera, Volume2, Info, X, MapPin, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import * as tmImage from '@teachablemachine/image';

const PakistanARGuide = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedPlace, setRecognizedPlace] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'error', 'loading'
  const [confidence, setConfidence] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const modelRef = useRef(null);
  const maxPredictionsRef = useRef(0);

  // Your Teachable Machine model URL
  const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/K9EMps9w-/';

  // Historical places database
  const placesDatabase = {
    taxila: {
      name: "Taxila",
      location: "Rawalpindi, Punjab",
      period: "6th century BCE to 5th century CE",
      description: "Taxila is one of the most important archaeological sites in Asia. It was a renowned center of learning and Buddhist culture, attracting students from across the ancient world.",
      narration: "Welcome to Taxila, one of the world's oldest universities. This ancient city flourished for over a thousand years as a center of Buddhist learning. You are standing in a place where scholars from China, Greece, and Persia once gathered to study philosophy, medicine, and arts. The ruins around you date back to the Gandhara civilization.",
      facts: [
        "UNESCO World Heritage Site since 1980",
        "Alexander the Great visited in 326 BCE",
        "Home to one of the earliest universities",
        "Major center of Gandhara art and culture"
      ],
      markers: [
        { id: 1, label: "Dharmarajika Stupa", x: 30, y: 40 },
        { id: 2, label: "Jaulian Monastery", x: 60, y: 35 },
        { id: 3, label: "Sirkap City Ruins", x: 45, y: 60 }
      ]
    },
    badshahi: {
      name: "Badshahi Mosque",
      location: "Lahore, Punjab",
      period: "Built in 1671-1673 CE",
      description: "The Badshahi Mosque is one of the largest mosques in the world and a stunning example of Mughal architecture.",
      narration: "You are witnessing the magnificent Badshahi Mosque, built by the sixth Mughal Emperor Aurangzeb. This architectural masterpiece can accommodate 100,000 worshippers. Notice the intricate red sandstone construction and the three massive marble domes. The mosque represents the pinnacle of Mughal architectural achievement in the Indian subcontinent.",
      facts: [
        "Built by Emperor Aurangzeb in 1671",
        "Can hold 100,000 worshippers",
        "Made of red sandstone with marble domes",
        "Second largest mosque in Pakistan"
      ],
      markers: [
        { id: 1, label: "Main Prayer Hall", x: 50, y: 45 },
        { id: 2, label: "Central Dome", x: 50, y: 25 },
        { id: 3, label: "Minarets", x: 25, y: 30 }
      ]
    },
    mohenjodaro: {
      name: "Mohenjo-daro",
      location: "Larkana, Sindh",
      period: "2500-1900 BCE",
      description: "Mohenjo-daro was one of the largest cities of the ancient Indus Valley Civilization, showcasing advanced urban planning.",
      narration: "Welcome to Mohenjo-daro, meaning 'Mound of the Dead'. You are standing in one of the world's earliest major cities, built around 2500 BCE. This civilization had advanced drainage systems, standardized bricks, and sophisticated urban planning that was unmatched for its time. The Great Bath you see was likely used for ritual purposes.",
      facts: [
        "UNESCO World Heritage Site",
        "One of the earliest urban settlements",
        "Advanced drainage and water systems",
        "Mysterious decline around 1900 BCE"
      ],
      markers: [
        { id: 1, label: "Great Bath", x: 40, y: 50 },
        { id: 2, label: "Granary", x: 60, y: 40 },
        { id: 3, label: "Assembly Hall", x: 35, y: 65 }
      ]
    }
  };

  // Update status message
  const updateStatus = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Load Teachable Machine model
  const loadModel = async () => {
    try {
      updateStatus('Loading AI model...', 'loading');
      const modelURL = MODEL_URL + 'model.json';
      const metadataURL = MODEL_URL + 'metadata.json';

      modelRef.current = await tmImage.load(modelURL, metadataURL);
      maxPredictionsRef.current = modelRef.current.getTotalClasses();
      
      updateStatus('AI model loaded successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Model loading error:', error);
      updateStatus('Failed to load AI model. Check your internet connection.', 'error');
      return false;
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      updateStatus('Initializing camera system...', 'loading');
      
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('Camera API not supported in this browser. Try Chrome or Safari.', 'error');
        return;
      }

      // Load model first
      updateStatus('Loading AI recognition model...', 'loading');
      const modelLoaded = await loadModel();
      if (!modelLoaded) {
        return;
      }

      // Request camera access
      updateStatus('Requesting camera access... Please allow when prompted.', 'loading');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      updateStatus('Camera access granted. Initializing video...', 'loading');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Set attributes for better mobile compatibility
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            updateStatus('Video stream ready. Starting playback...', 'loading');
            resolve();
          };
          
          videoRef.current.onerror = (err) => {
            reject(new Error('Video failed to load'));
          };
          
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Video loading timeout')), 10000);
        });
        
        // Start video playback
        try {
          await videoRef.current.play();
          updateStatus('Camera active! Point at a monument to identify it.', 'success');
          setIsScanning(true);
          
          // Start scanning after a short delay
          setTimeout(() => {
            startScanning();
          }, 1000);
          
        } catch (playErr) {
          console.error('Video play error:', playErr);
          updateStatus('Video playback failed: ' + playErr.message, 'error');
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        updateStatus('Camera permission denied. Please allow camera access and try again.', 'error');
      } else if (err.name === 'NotFoundError') {
        updateStatus('No camera found on this device.', 'error');
      } else if (err.name === 'NotReadableError') {
        updateStatus('Camera is already in use by another application.', 'error');
      } else {
        updateStatus('Camera error: ' + err.message, 'error');
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setIsScanning(false);
    setRecognizedPlace(null);
    setConfidence(0);
    setStatusMessage('');
    stopSpeaking();
  };

  // Real ML image recognition
  const recognizePlace = async () => {
    if (!modelRef.current || !videoRef.current) return null;

    try {
      const prediction = await modelRef.current.predict(videoRef.current);
      
      // Find highest confidence prediction
      let maxConfidence = 0;
      let recognizedClass = null;

      prediction.forEach(pred => {
        if (pred.probability > maxConfidence) {
          maxConfidence = pred.probability;
          recognizedClass = pred.className.toLowerCase();
        }
      });

      // Only trigger if confidence > 70%
      if (maxConfidence > 0.7) {
        return {
          place: recognizedClass,
          confidence: maxConfidence
        };
      }

      return null;
    } catch (error) {
      console.error('Recognition error:', error);
      return null;
    }
  };

  // Start scanning for places
  const startScanning = () => {
    updateStatus('Scanning for monuments...', 'info');
    
    scanIntervalRef.current = setInterval(async () => {
      if (!recognizedPlace) {
        const result = await recognizePlace();
        
        if (result && result.confidence > 0.7) {
          const placeKey = result.place.toLowerCase().replace(/[^a-z]/g, '');
          const place = placesDatabase[placeKey];
          
          if (place) {
            // Stop scanning once we recognize something
            if (scanIntervalRef.current) {
              clearInterval(scanIntervalRef.current);
            }
            
            updateStatus(`${place.name} recognized! Playing audio guide...`, 'success');
            setRecognizedPlace({ ...place, key: placeKey });
            setConfidence(result.confidence);
            speakNarration(place.narration);
          }
        }
      }
    }, 2000);
  };

  // Text-to-speech
  const speakNarration = (text) => {
    if ('speechSynthesis' in window) {
      stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Status icon
  const getStatusIcon = () => {
    switch (statusType) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Status color
  const getStatusColor = () => {
    switch (statusType) {
      case 'loading':
        return 'bg-blue-500/90';
      case 'success':
        return 'bg-green-500/90';
      case 'error':
        return 'bg-red-500/90';
      default:
        return 'bg-gray-500/90';
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Pakistan AR Guide
        </h1>
        <p className="text-gray-300 text-sm mt-1">AI-powered monument recognition</p>
      </div>

      {/* Status Message Bar */}
      {statusMessage && (
        <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-30 ${getStatusColor()} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md text-sm`}>
          {getStatusIcon()}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Camera View */}
      <div className="relative w-full h-full">
        {!isScanning ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900 p-6">
            <Camera className="w-24 h-24 text-blue-400 mb-6" />
            <h2 className="text-white text-2xl font-bold mb-3">Start Your Journey</h2>
            <p className="text-gray-300 text-center mb-8 max-w-md">
              Point your camera at historical places in Pakistan. Our AI will recognize them and tell you their stories.
            </p>
            <button
              onClick={startCamera}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </button>
            <div className="mt-8 text-gray-400 text-sm text-center max-w-md">
              <p className="mb-2">🤖 AI-Powered Recognition</p>
              <p className="text-xs">Taxila • Badshahi Mosque • Mohenjo-daro</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* AR Markers */}
            {recognizedPlace && recognizedPlace.markers && (
              <div className="absolute inset-0 pointer-events-none">
                {recognizedPlace.markers.map(marker => (
                  <div
                    key={marker.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  >
                    <div className="bg-blue-500 w-4 h-4 rounded-full animate-ping absolute"></div>
                    <div className="bg-blue-600 w-4 h-4 rounded-full"></div>
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded mt-2 whitespace-nowrap">
                      {marker.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recognition Overlay */}
            {recognizedPlace && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pb-8">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-white text-2xl font-bold">{recognizedPlace.name}</h2>
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {Math.round(confidence * 100)}% match
                      </span>
                    </div>
                    <p className="text-blue-400 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {recognizedPlace.location}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{recognizedPlace.period}</p>
                  </div>
                  <button
                    onClick={() => setShowInfo(true)}
                    className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full ml-3"
                  >
                    <Info className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${isSpeaking ? 'text-green-400' : 'text-gray-400'}`}>
                    <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    <span className="text-sm">{isSpeaking ? 'Speaking...' : 'Audio guide ready'}</span>
                  </div>
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Scanning indicator */}
            {!recognizedPlace && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-4 border-blue-500 rounded-lg animate-pulse"></div>
              </div>
            )}

            {/* Stop button */}
            <button
              onClick={stopCamera}
              className="absolute top-20 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-30"
            >
              <X className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Info Modal */}
      {showInfo && recognizedPlace && (
        <div className="absolute inset-0 bg-black/90 z-40 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-white text-xl font-bold">{recognizedPlace.name}</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-400 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {recognizedPlace.location}
                  </p>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    AI Confidence: {Math.round(confidence * 100)}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{recognizedPlace.period}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{recognizedPlace.description}</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-white font-semibold mb-3">Key Facts:</h4>
                <ul className="space-y-2">
                  {recognizedPlace.facts.map((fact, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => speakNarration(recognizedPlace.narration)}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Play Audio Guide Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PakistanARGuide;