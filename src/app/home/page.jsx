'use client'
import React, { useState, useEffect, useCallback } from 'react';

const stations = [
  { id: 1, name: "Station 1", ip: "192.168.17.101" },
  { id: 2, name: "Station 2", ip: "192.168.17.102" },
  { id: 3, name: "Station 3", ip: "192.168.17.103" },
  { id: 4, name: "Station 4", ip: "192.168.17.104" },
  { id: 5, name: "Station 5", ip: "192.168.17.105" }
];

const TrafficLight = ({ active, className = "" }) => {
  return (
    <div className={`border border-gray-800 p-1 bg-white ${className}`}>
      <div className={`w-4 h-4 rounded-full ${active === 'red' ? 'bg-red-500' : 'bg-red-200'} mb-1`}></div>
      <div className={`w-4 h-4 rounded-full ${active === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-200'} mb-1`}></div>
      <div className={`w-4 h-4 rounded-full ${active === 'green' ? 'bg-green-500' : 'bg-green-200'}`}></div>
    </div>
  );
};

const PedestrianCrossing = ({ className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-1 w-8 bg-gray-800"></div>
    ))}
  </div>
);

const TrafficSystemLayout = () => {
  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [mode, setMode] = useState("auto");
  const [currentLight, setCurrentLight] = useState("none");
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWebSocket = useCallback(() => {
    const wsConnection = new WebSocket(`ws://${selectedStation.ip}:81`);
    
    wsConnection.onopen = () => {
      console.log('Connected to WebSocket');
      setConnected(true);
    };

    wsConnection.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMode(data.mode);
        setCurrentLight(data.currentLight);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    setWs(wsConnection);

    return () => {
      wsConnection.close();
    };
  }, [selectedStation.ip]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedStation, connectWebSocket]);

  const changeMode = async (newMode) => {
    const res = await fetch(`http://${selectedStation.ip}/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `mode=${newMode}`,
    });
    if (res.ok) setMode(newMode);
  };

  const controlLight = async (light) => {
    if (mode === "manual") {
      await fetch(`http://${selectedStation.ip}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `light=${light}`,
      });
    }
  };

  return (
    <div className="w-full h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto relative h-[600px]">
        {/* Roads and Layout - Same as before */}
        <div className="absolute top-36 left-0 w-full h-0.5 bg-gray-800"></div>
        <div className="absolute top-56 left-0 w-full h-0.5 bg-gray-800"></div>

        {/* Traffic Lights - Now with active state */}
        <TrafficLight active={currentLight} className="absolute top-24 left-36" />
        <TrafficLight active={currentLight} className="absolute top-24 left-60" />
        <TrafficLight active={currentLight} className="absolute top-40 left-48" />
        <TrafficLight active={currentLight} className="absolute top-60 left-40" />
        
        {/* Other traffic lights... */}

        {/* Control Panel */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <select
                className="mt-2 p-2 border rounded mr-2"
                value={selectedStation.id}
                onChange={(e) => setSelectedStation(stations.find(s => s.id == e.target.value))}
              >
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => changeMode("auto")}
                className={`px-4 py-2 ${mode === "auto" ? "bg-blue-500" : "bg-gray-500"} text-white rounded mr-2`}
              >
                Auto Mode
              </button>
              
              <button
                onClick={() => changeMode("manual")}
                className={`px-4 py-2 ${mode === "manual" ? "bg-blue-500" : "bg-gray-500"} text-white rounded mr-2`}
              >
                Manual Mode
              </button>
              
              <button
                onClick={() => changeMode("yellow")}
                className={`px-4 py-2 ${mode === "yellow" ? "bg-blue-500" : "bg-gray-500"} text-white rounded mr-2`}
              >
                Yellow Mode
              </button>

              {mode === "manual" && (
                <div className="mt-4 flex gap-4">
                  <button onClick={() => controlLight("red")} className="px-4 py-2 bg-red-500 text-white rounded">Red</button>
                  <button onClick={() => controlLight("yellow")} className="px-4 py-2 bg-yellow-500 text-black rounded">Yellow</button>
                  <button onClick={() => controlLight("green")} className="px-4 py-2 bg-green-500 text-white rounded">Green</button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
              <span className="text-sm">{connected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficSystemLayout;