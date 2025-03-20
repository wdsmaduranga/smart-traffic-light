"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Suspense } from 'react'
import TrafficCom from '@/components/trafficui'

const TrafficSystemLayout = () => {
 
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <TrafficCom/>
  </Suspense>
  );
};

export default TrafficSystemLayout;
