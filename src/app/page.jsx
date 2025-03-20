"use client";

import React, { useState, useEffect, useCallback } from "react";

const stations = [
  { id: 1, name: "Station 1", ip: "192.168.17.101" },
  { id: 2, name: "Station 2", ip: "192.168.17.102" },
  { id: 3, name: "Station 3", ip: "192.168.17.103" },
  { id: 4, name: "Station 4", ip: "192.168.17.104" },
  // { id: 5, name: "Station 5", ip: "192.168.17.105" },
];

const TrafficLight = ({ active, className = "" }) => {
  return (
    <div className={`border border-gray-800 p-1 bg-white ${className}`}>
      <div
        className={`w-4 h-4 rounded-full ${
          active === "red" ? "bg-red-500" : "bg-red-200"
        } mb-1`}
      ></div>
      <div
        className={`w-4 h-4 rounded-full ${
          active === "yellow" ? "bg-yellow-500" : "bg-yellow-200"
        } mb-1`}
      ></div>
      <div
        className={`w-4 h-4 rounded-full ${
          active === "green" ? "bg-green-500" : "bg-green-200"
        }`}
      ></div>
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
const StationControls = ({
  station,
  stationState,
  onModeChange,
  onLightChange,
}) => {
  return (
    <div className="text-center p-4 border rounded">
      <h3 className="font-bold mb-2">{station.name}</h3>
      <div className="flex items-center justify-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            stationState?.connected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span>{stationState?.connected ? "Connected" : "Disconnected"}</span>
      </div>
      {/* stationState */}
      <div className="flex gap-2 justify-center mb-2">
        <button
          onClick={() => onModeChange(station.ip, "auto")}
          className={`px-2 py-1 text-sm ${
            stationState?.mode === "auto" ? "bg-blue-500" : "bg-gray-500"
          } text-white rounded`}
        >
          Auto
        </button>
        <button
          onClick={() => onModeChange(station.ip, "manual")}
          className={`px-2 py-1 text-sm ${
            stationState?.mode === "manual" ? "bg-blue-500" : "bg-gray-500"
          } text-white rounded`}
        >
          Manual
        </button>
        <button
          onClick={() => onModeChange(station.ip, "yellow")}
          className={`px-2 py-1 text-sm ${
            stationState?.mode === "yellow" ? "bg-blue-500" : "bg-gray-500"
          } text-white rounded`}
        >
          Yellow
        </button>
      </div>

      {stationState?.mode === "manual" && (
        <div className="flex gap-2 justify-center">
          {stationState.currentLight && (
            <>
              <button
                onClick={() => onLightChange(station.ip, "red")}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
              >
                Red
              </button>
              <button
                onClick={() => onLightChange(station.ip, "yellow")}
                className="px-2 py-1 text-sm bg-yellow-500 text-black rounded"
              >
                Yellow
              </button>
              <button
                onClick={() => onLightChange(station.ip, "green")}
                className="px-2 py-1 text-sm bg-green-500 text-white rounded"
              >
                Green
              </button>
            </>
          )}
          {stationState.currentLight1 && (
            <>
              <button
                onClick={() => onLightChange(station.ip, "1")}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
              >
                Path 1
              </button>
 
            </>
          )}
          {stationState.currentLight2 && (
            <>
              <button
                onClick={() => onLightChange(station.ip, "2")}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
              >
                Path 2
              </button>
             
            </>
          )}
          {stationState.currentLight3 && (
            <>
              <button
                onClick={() => onLightChange(station.ip, "3")}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
              >
                Path 3
              </button>
             
            </>
          )}
           {stationState.currentLight4 && (
            <>
              <button
                onClick={() => onLightChange(station.ip, "4")}
                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
              >
                Path 3
              </button>
             
            </>
          )}
        </div>
      )}

      <div className="mt-2 text-sm">
        <p>Mode: {stationState?.mode}</p>
        <p>Light: {stationState?.currentLight}</p>
      </div>
    </div>
  );
};
const TrafficSystemLayout = () => {
  const [stationStates, setStationStates] = useState(
    stations.reduce(
      (acc, station) => ({
        ...acc,
        [station.id]: {
          mode: "auto",
          currentLight: "none",
          connected: false,
        },
      }),
      {}
    )
  );
  useEffect(() => {
    // Create WebSocket connections for all stations
    const connections = stations.map((station) => {
      const ws = new WebSocket(`ws://${station.ip}:81`);

      ws.onopen = () => {
        setStationStates((prev) => ({
          ...prev,
          [station.id]: {
            ...prev[station.id],
            connected: true,
          },
        }));
      };

      ws.onclose = () => {
        setStationStates((prev) => ({
          ...prev,
          [station.id]: {
            ...prev[station.id],
            connected: false,
          },
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setStationStates((prev) => ({
            ...prev,
            [station.id]: {
              ...prev[station.id],
              mode: data.mode,
              currentLight: data.currentLight,
              currentLight1: data.currentLight1,
              currentLight2: data.currentLight2,
              currentLight3: data.currentLight3,
              currentLight4: data.currentLight4,
            },
          }));
        } catch (e) {
          console.error(`Error parsing message from station ${station.id}:`, e);
        }
      };

      return ws;
    });

    // Cleanup function to close all connections
    return () => {
      connections.forEach((ws) => ws.close());
    };
  }, []); // Empty dependency array - run once on mount
  const handleModeChange = async (ip, newMode) => {
    try {
      const res = await fetch(`http://${ip}/mode`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `mode=${newMode}`,
      });
      if (!res.ok) {
        console.error("Failed to change mode:", await res.text());
      }
    } catch (error) {
      console.error("Error changing mode:", error);
    }
  };

  const handleLightChange = async (ip, light) => {
    try {
      const res = await fetch(`http://${ip}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `light=${light}`,
      });
      if (!res.ok) {
        console.error("Failed to change light:", await res.text());
      }
    } catch (error) {
      console.error("Error changing light:", error);
    }
  };

  return (
    <div className="w-full h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto relative h-[600px]">
        {/* Horizontal Road */}
        <div className="absolute top-36 left-0 w-full h-0.5 bg-gray-800"></div>
        <div className="absolute top-56 left-0 w-full h-0.5 bg-gray-800"></div>

        {/* Vertical Roads */}
        {/* Station 1 */}
        <div className="absolute top-0 left-36 w-0.5 h-96 bg-gray-800"></div>
        <div className="absolute top-0 left-56 w-0.5 h-96 bg-gray-800"></div>
        {/* Station 2 */}
        <div className="absolute top-56 left-1/3 w-0.5 h-48 bg-gray-800"></div>
        <div className="absolute top-56 left-80 w-0.5 h-48 bg-gray-800"></div>
        {/* Station 3 */}
        <div className="absolute -top-12 right-1/4 w-0.5 h-48 bg-gray-800"></div>
        <div className="absolute -top-12 right-48 w-0.5 h-48 bg-gray-800"></div>
        {/* Station 4 & 5 */}
        <div className="absolute top-56 right-48 w-0.5 h-96 bg-gray-800"></div>
        <div className="absolute top-56 right-1/4 w-0.5 h-96 bg-gray-800"></div>

        {/* Station 1 - 4-way Traffic Lights */}
        <TrafficLight
          active={stationStates[1]?.currentLight1}
          className="absolute top-24 left-36"
        />
        <TrafficLight
          active={stationStates[1]?.currentLight2}
          className="absolute top-24 left-60"
        />
        <TrafficLight
          active={stationStates[1]?.currentLight3}
          className="absolute top-40 left-48"
        />
        <TrafficLight
          active={stationStates[1]?.currentLight4}
          className="absolute top-60 left-40"
        />
        {/* Station 2 - 3-way Traffic Lights */}
        <TrafficLight
          active={stationStates[2]?.currentLight1}
          className="absolute top-36 left-[360px]"
        />
        <TrafficLight
          active={stationStates[2]?.currentLight2}
          className="absolute top-40 left-[400px]"
        />
        <TrafficLight
          active={stationStates[2]?.currentLight3}
          className="absolute top-48 left-[360px] -ml-12"
        />

        {/* Station 3 - Pedestrian Crossing */}
        <PedestrianCrossing className="absolute top-40 left-[550px] -mr-4" />
        <TrafficLight
          active={stationStates[3]?.currentLight}
          className="absolute top-20 left-[550px]"
        />

        {/* Station 4 - 4way Intersection */}
        <TrafficLight
          active={stationStates[4]?.currentLight1}
          className="absolute top-20 left-[930px]"
        />
        <TrafficLight
          active={stationStates[4]?.currentLight2}
          className="absolute top-36 left-[850px]"
        />
        <TrafficLight
          active={stationStates[4]?.currentLight3}
          className="absolute top-40 left-[940px]"
        />
        <TrafficLight
          active={stationStates[4]?.currentLight4}
          className="absolute top-60 left-[860px]"
        />

        {/* Station 5 - Pedestrian Crossing */}
        {/* <PedestrianCrossing className="absolute top-40 right-20 -mr-4" />
        <TrafficLight
          active={stationStates[5]?.currentLight}
          className="absolute top-20 left-[1060px]"
        /> */}

        {/* Control Panel */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            {/* Status Panel */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-5 gap-4">
                {stations.map((station) => (
                  <StationControls
                    key={station.id}
                    station={station}
                    stationState={stationStates[station.id]}
                    onModeChange={handleModeChange}
                    onLightChange={handleLightChange}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">System Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficSystemLayout;
